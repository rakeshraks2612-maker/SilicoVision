"""Single-image inference helpers for trained wafer-defect classifiers."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path

import cv2
import numpy as np
import torch
from torchvision import transforms

from src.data.wafer_dataset import WaferPreprocessConfig
from src.models import build_resnet18
from src.training.trainer import select_device


@dataclass(frozen=True)
class Prediction:
    """Human-readable output for one wafer-map prediction."""

    predicted_class: str
    confidence: float

    def to_dict(self) -> dict[str, str | float]:
        return asdict(self)


def preprocess_wafer_array(
    image: np.ndarray, config: WaferPreprocessConfig | None = None
) -> torch.Tensor:
    """Resize and normalize a raw map or grayscale image exactly as training does."""
    config = config or WaferPreprocessConfig()
    if image.ndim == 3 and image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2GRAY)
    elif image.ndim == 3 and image.shape[2] == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    elif image.ndim == 3 and image.shape[2] == 1:
        image = image[:, :, 0]
    if image.ndim != 2:
        raise ValueError(f"Expected a two-dimensional wafer image; got shape {image.shape}.")
    image = np.asarray(image)
    if image.size == 0:
        raise ValueError("Input wafer image is empty.")
    # Raw WM-811K maps use 0/1/2; rendered images conventionally use 0/127/255.
    if np.nanmax(image) <= 2:
        image = np.array([0, 127, 255], dtype=np.uint8)[np.clip(image, 0, 2).astype(np.uint8)]
    else:
        image = np.clip(image, 0, 255).astype(np.uint8)
    image = cv2.resize(image, (config.image_size, config.image_size), interpolation=cv2.INTER_NEAREST)
    image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB).astype(np.float32) / 255.0
    tensor = torch.from_numpy(image).permute(2, 0, 1)
    return transforms.Normalize(mean=config.mean, std=config.std)(tensor).unsqueeze(0)


def load_wafer_image(path: str | Path) -> np.ndarray:
    """Load a PNG/JPEG/etc. wafer image, or a raw two-dimensional ``.npy`` map."""
    path = Path(path)
    if not path.is_file():
        raise FileNotFoundError(f"Input image was not found: {path}")
    if path.suffix.lower() == ".npy":
        return np.load(path, allow_pickle=False)
    image = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    if image is None:
        raise ValueError(f"OpenCV could not decode the input image: {path}")
    return image


def load_model(checkpoint_path: str | Path, device: torch.device | None = None) -> tuple[torch.nn.Module, dict[str, int], torch.device]:
    """Restore a wafer ResNet-18 and its saved class-to-index mapping."""
    device = device or select_device()
    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)
    class_to_index = checkpoint["class_to_index"]
    model = build_resnet18(num_classes=len(class_to_index), pretrained=False).to(device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    return model, class_to_index, device


def predict_wafer_image(
    image_path: str | Path, checkpoint_path: str | Path, device: torch.device | None = None
) -> Prediction:
    """Return the predicted defect class and softmax confidence for one image."""
    model, class_to_index, device = load_model(checkpoint_path, device)
    image = preprocess_wafer_array(load_wafer_image(image_path)).to(device)
    with torch.no_grad():
        probabilities = torch.softmax(model(image), dim=1)[0]
    class_index = int(probabilities.argmax().item())
    index_to_class = {index: name for name, index in class_to_index.items()}
    return Prediction(index_to_class[class_index], float(probabilities[class_index].item()))
