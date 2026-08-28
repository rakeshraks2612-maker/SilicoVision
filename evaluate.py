"""Evaluate the best saved ResNet-18 checkpoint on the WM-811K test split."""

import argparse
from pathlib import Path

import torch

from config import CHECKPOINT_DIR, DEFAULT_BATCH_SIZE, DEFAULT_NUM_WORKERS, OUTPUT_DIR
from src.data import create_dataloaders
from src.evaluation import evaluate_predictions, ordered_class_names, predict
from src.models import build_resnet18
from src.training.trainer import select_device


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate a WM-811K best-model checkpoint.")
    parser.add_argument("--data", type=Path, default=Path("dataset/LSWMD.pkl"))
    parser.add_argument("--checkpoint", type=Path, default=CHECKPOINT_DIR / "efficientnet_b0_wm811k" / "best.pt")
    parser.add_argument("--output-dir", type=Path, default=OUTPUT_DIR / "evaluation")
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    parser.add_argument("--workers", type=int, default=DEFAULT_NUM_WORKERS)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    device = select_device()
    checkpoint = torch.load(args.checkpoint, map_location=device, weights_only=False)
    class_to_index = checkpoint["class_to_index"]
    loaders, _ = create_dataloaders(args.data, batch_size=args.batch_size, num_workers=args.workers)
    model = build_resnet18(num_classes=len(class_to_index), pretrained=False).to(device)
    model.load_state_dict(checkpoint["model_state_dict"])
    targets, probabilities = predict(model, loaders["test"], device)
    metrics = evaluate_predictions(targets, probabilities, ordered_class_names(class_to_index), args.output_dir)
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"Macro F1: {metrics['f1_macro']:.4f}")
    print(f"Saved report and plots to: {args.output_dir}")


if __name__ == "__main__":
    main()
