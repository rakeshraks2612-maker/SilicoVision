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


def select_device() -> torch.device:
    """Prefer CUDA or MPS when available, otherwise use CPU."""
    if torch.cuda.is_available():
        return torch.device("cuda")
    elif torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")



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
    """Resize and normalize a raw map or image exactly as training does."""
    config = config or WaferPreprocessConfig()
    image = np.asarray(image)
    if image.size == 0:
        raise ValueError("Input wafer image is empty.")

    # 1. Handle 2-D raw integer maps (0=background, 1=pass die, 2=defect die)
    if image.ndim == 2 and np.nanmax(image) <= 2:
        mapped = np.array([0, 127, 255], dtype=np.uint8)[
            np.clip(image, 0, 2).astype(np.uint8)
        ]
    else:
        # 2. Handle RGB/RGBA/Grayscale rendered images
        if image.ndim == 3 and image.shape[2] in (3, 4):
            b = image[:, :, 0].astype(np.float32)
            g = image[:, :, 1].astype(np.float32)
            r = image[:, :, 2].astype(np.float32)
            gray = cv2.cvtColor(image[:, :, :3], cv2.COLOR_BGR2GRAY)
            # Detect defect pixels by either brightness or colored saturation
            defect_mask = (gray > 160) | ((g - b) > 25) | ((r - b) > 35)
        elif image.ndim == 3 and image.shape[2] == 1:
            gray = image[:, :, 0]
            defect_mask = gray > 160
        elif image.ndim == 2:
            gray = image
            defect_mask = gray > 160
        else:
            raise ValueError(f"Expected a 2-D or 3-D wafer image; got shape {image.shape}.")

        h, w = gray.shape
        mapped = np.zeros((h, w), dtype=np.uint8)

        # Wafer die body mask (non-black pixels)
        wafer_mask = gray > 12

        # Assign discrete baseline 127 to normal dies, and 255 to defects
        mapped[wafer_mask] = 127
        mapped[wafer_mask & defect_mask] = 255

    mapped = cv2.resize(
        mapped,
        (config.image_size, config.image_size),
        interpolation=cv2.INTER_NEAREST,
    )
    image_rgb = cv2.cvtColor(mapped, cv2.COLOR_GRAY2RGB).astype(np.float32) / 255.0
    tensor = torch.from_numpy(image_rgb).permute(2, 0, 1)
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
