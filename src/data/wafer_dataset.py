"""PyTorch input pipeline for WM-811K wafer-defect classification."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping

import cv2
import numpy as np
import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
from torchvision.transforms import InterpolationMode


FAILURE_CLASSES = (
    "Center", "Donut", "Edge-Loc", "Edge-Ring", "Loc", "Random",
    "Scratch", "Near-full",
)
CLASS_TO_INDEX = {name: index for index, name in enumerate(FAILURE_CLASSES)}


def decode_label(value: Any) -> str | None:
    """Decode a scalar or MATLAB-style nested label array from WM-811K."""
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return None
    values = np.asarray(value).ravel()
    if not values.size:
        return None
    label = str(values[0]).strip()
    return label if label and label.lower() != "nan" else None


@dataclass(frozen=True)
class WaferPreprocessConfig:
    """Image transformation settings shared by all dataset splits."""

    image_size: int = 224
    mean: tuple[float, float, float] = (0.485, 0.456, 0.406)
    std: tuple[float, float, float] = (0.229, 0.224, 0.225)


def build_train_augmentation() -> transforms.Compose:
    """Return geometry-preserving augmentations appropriate for wafer maps.

    Nearest-neighbour interpolation retains the three discrete map states
    (outside, normal die, defect) instead of blending them into new values.
    """
    return transforms.Compose([
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(
            degrees=180,
            interpolation=InterpolationMode.NEAREST,
            fill=0.0,
        ),
        transforms.RandomAffine(
            degrees=0,
            translate=(0.03, 0.03),
            scale=(0.98, 1.02),
            interpolation=InterpolationMode.NEAREST,
            fill=0.0,
        ),
    ])


class WaferMapDataset(Dataset[tuple[torch.Tensor, torch.Tensor]]):
    """Dataset that turns variable-size WM-811K maps into normalized tensors.

    Each map uses the standard WM-811K values: 0=outside wafer, 1=good die,
    and 2=defective die. Values are mapped to 0, 127, and 255 before OpenCV
    nearest-neighbour resizing, preserving the discrete defect geometry.
    """

    def __init__(
        self,
        frame: pd.DataFrame,
        preprocess: WaferPreprocessConfig | None = None,
        class_to_index: Mapping[str, int] = CLASS_TO_INDEX,
        augmentation: transforms.Compose | None = None,
    ) -> None:
        required = {"waferMap", "label"}
        missing = required.difference(frame.columns)
        if missing:
            raise ValueError(f"Dataset frame missing required columns: {sorted(missing)}")
        self.frame = frame.reset_index(drop=True)
        self.preprocess = preprocess or WaferPreprocessConfig()
        self.class_to_index = dict(class_to_index)
        self.augmentation = augmentation
        self.normalizer = transforms.Normalize(
            mean=self.preprocess.mean,
            std=self.preprocess.std,
        )

    def __len__(self) -> int:
        return len(self.frame)

    def _preprocess_map(self, wafer_map: Any) -> torch.Tensor:
        image = np.asarray(wafer_map)
        if image.ndim != 2:
            raise ValueError(f"Expected a 2-D wafer map; received shape {image.shape}")

        # Keep the three semantic states distinct before interpolation.
        image = np.array([0, 127, 255], dtype=np.uint8)[
            np.clip(image, 0, 2).astype(np.uint8)
        ]
        image = cv2.resize(
            image,
            (self.preprocess.image_size, self.preprocess.image_size),
            interpolation=cv2.INTER_NEAREST,
        )
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB).astype(np.float32) / 255.0
        tensor = torch.from_numpy(image).permute(2, 0, 1)
        if self.augmentation is not None:
            tensor = self.augmentation(tensor)
        return self.normalizer(tensor)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, torch.Tensor]:
        row = self.frame.iloc[index]
        image = self._preprocess_map(row["waferMap"])
        target = torch.tensor(self.class_to_index[row["label"]], dtype=torch.long)
        return image, target


def load_labeled_wafers(dataset_path: str | Path) -> pd.DataFrame:
    """Load only the eight labelled failure-pattern classes from WM-811K."""
    frame = pd.read_pickle(dataset_path).copy()
    required = {"waferMap", "failureType"}
    missing = required.difference(frame.columns)
    if missing:
        raise ValueError(f"Not a standard WM-811K file; missing {sorted(missing)}")
    frame["label"] = frame["failureType"].map(decode_label)
    frame = frame.loc[frame["label"].isin(CLASS_TO_INDEX)].copy()
    if frame.empty:
        raise ValueError("No labelled failure-pattern maps were found in the dataset.")
    if "trianTestLabel" in frame:
        frame["provided_split"] = frame["trianTestLabel"].map(decode_label)
    return frame.reset_index(drop=True)


def _split_frame(
    frame: pd.DataFrame, validation_fraction: float, test_fraction: float, random_state: int
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Create stratified splits, respecting WM-811K's provided test split if present."""
    if not 0 < validation_fraction < 1 or not 0 < test_fraction < 1:
        raise ValueError("validation_fraction and test_fraction must be between 0 and 1.")

    if "provided_split" in frame and (frame["provided_split"] == "Test").any():
        test = frame.loc[frame["provided_split"] == "Test"]
        train_pool = frame.loc[frame["provided_split"] != "Test"]
        # Validation is a fraction of the provided training partition.
        train, validation = train_test_split(
            train_pool, test_size=validation_fraction, stratify=train_pool["label"], random_state=random_state
        )
    else:
        train_pool, test = train_test_split(
            frame, test_size=test_fraction, stratify=frame["label"], random_state=random_state
        )
        validation_relative = validation_fraction / (1 - test_fraction)
        train, validation = train_test_split(
            train_pool, test_size=validation_relative, stratify=train_pool["label"], random_state=random_state
        )
    return train.copy(), validation.copy(), test.copy()


def create_dataloaders(
    dataset_path: str | Path,
    batch_size: int = 32,
    num_workers: int = 0,
    validation_fraction: float = 0.1,
    test_fraction: float = 0.1,
    random_state: int = 42,
    preprocess: WaferPreprocessConfig | None = None,
) -> tuple[dict[str, DataLoader], dict[str, int]]:
    """Build train, validation, and test DataLoaders from a WM-811K pickle.

    ``num_workers=0`` is the safest cross-platform default (including Windows).
    Set it higher after verifying multiprocessing works in the training runtime.
    """
    if batch_size < 1:
        raise ValueError("batch_size must be positive.")
    frame = load_labeled_wafers(dataset_path)
    train, validation, test = _split_frame(frame, validation_fraction, test_fraction, random_state)
    config = preprocess or WaferPreprocessConfig()
    pin_memory = torch.cuda.is_available()
    loaders = {
        "train": DataLoader(
            WaferMapDataset(train, config, augmentation=build_train_augmentation()),
            batch_size=batch_size,
            shuffle=True,
            num_workers=num_workers,
            pin_memory=pin_memory,
        ),
        "validation": DataLoader(WaferMapDataset(validation, config), batch_size=batch_size, shuffle=False,
                                 num_workers=num_workers, pin_memory=pin_memory),
        "test": DataLoader(WaferMapDataset(test, config), batch_size=batch_size, shuffle=False,
                            num_workers=num_workers, pin_memory=pin_memory),
    }
    return loaders, CLASS_TO_INDEX.copy()
