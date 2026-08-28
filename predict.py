"""Predict a wafer failure pattern from one new wafer image."""

import argparse
import json
from pathlib import Path

from config import CHECKPOINT_DIR
from src.evaluation import predict_wafer_image


def main() -> None:
    parser = argparse.ArgumentParser(description="Classify one wafer-defect image.")
    parser.add_argument("--input", required=True, type=Path, help="PNG/JPEG/etc. image or raw .npy wafer map.")
    parser.add_argument("--checkpoint", type=Path, default=CHECKPOINT_DIR / "efficientnet_b0_wm811k" / "best.pt")
    args = parser.parse_args()

    prediction = predict_wafer_image(args.input, args.checkpoint)
    print(json.dumps(prediction.to_dict(), indent=2))


if __name__ == "__main__":
    main()
