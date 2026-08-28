"""Train a ResNet-18 wafer-defect classifier on WM-811K."""

import argparse
from pathlib import Path

import torch

from config import (
    CHECKPOINT_DIR,
    DEFAULT_BATCH_SIZE,
    DEFAULT_EPOCHS,
    DEFAULT_NUM_WORKERS,
    DEFAULT_TEST_FRACTION,
    DEFAULT_VALIDATION_FRACTION,
    LOG_DIR,
)
from src.data import create_dataloaders
from src.data.wafer_dataset import CLASS_TO_INDEX
from src.models import build_resnet18
from src.training import WeightedFocalLoss, inverse_frequency_class_weights, train_model


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train a WM-811K ResNet-18 classifier.")
    parser.add_argument("--data", type=Path, default=Path("dataset/LSWMD.pkl"))
    parser.add_argument("--epochs", type=int, default=DEFAULT_EPOCHS)
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    parser.add_argument("--learning-rate", type=float, default=3e-4)
    parser.add_argument("--workers", type=int, default=DEFAULT_NUM_WORKERS)
    parser.add_argument("--patience", type=int, default=12)
    parser.add_argument("--checkpoint-dir", type=Path, default=CHECKPOINT_DIR / "efficientnet_b2_wm811k")
    parser.add_argument("--log-dir", type=Path, default=LOG_DIR / "tensorboard" / "efficientnet_b2_wm811k")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    torch.manual_seed(42)
    loaders, class_to_index = create_dataloaders(
        args.data,
        batch_size=args.batch_size,
        num_workers=args.workers,
        validation_fraction=DEFAULT_VALIDATION_FRACTION,
        test_fraction=DEFAULT_TEST_FRACTION,
    )
    train_labels = [CLASS_TO_INDEX[label] for label in loaders["train"].dataset.frame["label"]]
    class_weights = inverse_frequency_class_weights(train_labels, num_classes=len(class_to_index))
    model = build_resnet18(num_classes=len(class_to_index),pretrained=True,freeze_backbone=False,)
    criterion = WeightedFocalLoss(class_weights=class_weights, gamma=2.0)
    optimizer = torch.optim.AdamW(
        (parameter for parameter in model.parameters() if parameter.requires_grad),
        lr=args.learning_rate,
        weight_decay=5e-4,
    )
    result = train_model(
        model=model,
        loaders=loaders,
        criterion=criterion,
        optimizer=optimizer,
        class_to_index=class_to_index,
        epochs=args.epochs,
        checkpoint_dir=args.checkpoint_dir,
        log_dir=args.log_dir,
        early_stopping_patience=args.patience,
    )
    print(f"Best checkpoint: {result['best_checkpoint']}")


if __name__ == "__main__":
    main()
