import numpy as np
import pandas as pd
import torch

from src.data.wafer_dataset import (
    WaferMapDataset,
    WaferPreprocessConfig,
    build_train_augmentation,
)


def test_wafer_map_is_resized_normalized_and_label_encoded() -> None:
    frame = pd.DataFrame({
        "waferMap": [np.array([[0, 1], [2, 1]], dtype=np.uint8)],
        "label": ["Center"],
    })
    dataset = WaferMapDataset(frame, WaferPreprocessConfig(image_size=224))

    image, target = dataset[0]

    assert image.shape == (3, 224, 224)
    assert image.dtype.is_floating_point
    assert target.item() == 0
    assert float(image.min()) >= -2.2
    assert float(image.max()) <= 2.7


def test_training_augmentation_keeps_tensor_shape() -> None:
    augmentation = build_train_augmentation()
    image = augmentation(torch.zeros((3, 224, 224), dtype=torch.float32))

    assert image.shape == (3, 224, 224)
