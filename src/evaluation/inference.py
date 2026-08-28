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
    """Resize and normalize any wafer image or array into standard 3-state tensor representation."""
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
        # 2. Handle RGB / RGBA / Grayscale rendered images
        if image.ndim == 3 and image.shape[2] in (3, 4):
            b = image[:, :, 0].astype(int)
            g = image[:, :, 1].astype(int)
            r = image[:, :, 2].astype(int)
            # Detect defect dies (Red, Green, Blue, Yellow, or high contrast anomalies)
            is_red = (r > 130) & (g < 120) & (b < 120)
            is_green = (g > 130) & (r < 120) & (b < 120)
            is_blue = (b > 130) & (r < 120) & (g < 120)
            is_yellow = (r > 130) & (g > 130) & (b < 100)
            is_white = (r > 130) & (g > 130) & (b > 130)
            is_dark_defect = (r < 40) & (g < 40) & (b < 40)
            
            is_defect = is_red | is_green | is_blue | is_yellow
            all_dies = is_white | is_defect | (image[:, :, 0] > 20)
        else:
            gray = image if image.ndim == 2 else image[:, :, 0]
            is_defect = gray > 180
            all_dies = gray > 20

        h, w = all_dies.shape[:2]
        mapped = np.zeros((h, w), dtype=np.uint8)

        # Use morphological closing on all dies to get the solid circular wafer domain
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (max(5, h // 40), max(5, w // 40)))
        closed = cv2.morphologyEx(all_dies.astype(np.uint8), cv2.MORPH_CLOSE, kernel)
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if contours:
            c = max(contours, key=cv2.contourArea)
            (cx, cy), radius = cv2.minEnclosingCircle(c)
            # Inside wafer circular domain = 127
            cv2.circle(mapped, (int(cx), int(cy)), int(radius * 0.97), 127, -1)

            # Map defect dies
            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(is_defect.astype(np.uint8))
            for i in range(1, num_labels):
                if stats[i, cv2.CC_STAT_AREA] >= 3:
                    x, y, bw, bh = stats[i, cv2.CC_STAT_LEFT], stats[i, cv2.CC_STAT_TOP], stats[i, cv2.CC_STAT_WIDTH], stats[i, cv2.CC_STAT_HEIGHT]
                    pad = max(1, min(bw, bh) // 4)
                    mapped[max(0, y-pad):min(h, y+bh+pad), max(0, x-pad):min(w, x+bw+pad)] = 255
        else:
            mapped[all_dies > 0] = 127
            mapped[is_defect] = 255

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
