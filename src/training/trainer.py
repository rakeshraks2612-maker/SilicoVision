"""Training utilities for wafer-defect classifiers."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import torch
from torch import nn
from torch.optim import Optimizer
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.utils.data import DataLoader
from torch.utils.tensorboard import SummaryWriter


@dataclass
class EarlyStopping:
    """Stop training when validation loss ceases to improve."""

    patience: int = 7
    min_delta: float = 0.0
    best: float = float("inf")
    bad_epochs: int = 0

    def step(self, value: float) -> bool:
        if value < self.best - self.min_delta:
            self.best = value
            self.bad_epochs = 0
            return False
        self.bad_epochs += 1
        return self.bad_epochs >= self.patience


def select_device() -> torch.device:
    """Prefer CUDA when available, otherwise use CPU."""
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def _run_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
    optimizer: Optimizer | None = None,
    scaler: torch.cuda.amp.GradScaler | None = None,
) -> dict[str, float]:
    is_training = optimizer is not None
    model.train(is_training)
    total_loss = 0.0
    total_correct = 0
    total_examples = 0
    use_amp = device.type == "cuda" and scaler is not None

    context = torch.enable_grad if is_training else torch.no_grad
    with context():
        for images, targets in loader:
            images = images.to(device, non_blocking=True)
            targets = targets.to(device, non_blocking=True)
            if is_training:
                optimizer.zero_grad(set_to_none=True)
            with torch.cuda.amp.autocast(enabled=use_amp):
                logits = model(images)
                loss = criterion(logits, targets)

            if is_training:
                if use_amp:
                    scaler.scale(loss).backward()
                    scaler.step(optimizer)
                    scaler.update()
                else:
                    loss.backward()
                    optimizer.step()

            batch_size = targets.size(0)
            total_loss += loss.detach().item() * batch_size
            total_correct += (logits.argmax(dim=1) == targets).sum().item()
            total_examples += batch_size

    if total_examples == 0:
        raise ValueError("DataLoader produced no batches.")
    return {"loss": total_loss / total_examples, "accuracy": total_correct / total_examples}


def save_checkpoint(
    path: Path,
    model: nn.Module,
    optimizer: Optimizer,
    scheduler: ReduceLROnPlateau,
    epoch: int,
    metrics: dict[str, float],
    class_to_index: dict[str, int],
) -> None:
    """Save enough state to evaluate or resume an experiment."""
    path.parent.mkdir(parents=True, exist_ok=True)
    torch.save({
        "epoch": epoch,
        "model_state_dict": model.state_dict(),
        "optimizer_state_dict": optimizer.state_dict(),
        "scheduler_state_dict": scheduler.state_dict(),
        "metrics": metrics,
        "class_to_index": class_to_index,
    }, path)


def train_model(
    model: nn.Module,
    loaders: dict[str, DataLoader],
    criterion: nn.Module,
    optimizer: Optimizer,
    class_to_index: dict[str, int],
    epochs: int,
    checkpoint_dir: str | Path,
    log_dir: str | Path,
    early_stopping_patience: int = 7,
    scheduler_patience: int = 3,
) -> dict[str, Any]:
    """Train with validation after every epoch and return run metadata."""
    if epochs < 1:
        raise ValueError("epochs must be positive.")
    if not {"train", "validation", "test"}.issubset(loaders):
        raise ValueError("loaders must contain train, validation, and test loaders.")

    device = select_device()
    model = model.to(device)
    criterion = criterion.to(device)
    scaler = torch.cuda.amp.GradScaler(enabled=device.type == "cuda")
    scheduler = ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=scheduler_patience)
    stopper = EarlyStopping(patience=early_stopping_patience)
    checkpoint_dir = Path(checkpoint_dir)
    writer = SummaryWriter(log_dir=str(log_dir))
    history: list[dict[str, float]] = []
    best_epoch = 0

    try:
        for epoch in range(1, epochs + 1):
            train_metrics = _run_epoch(model, loaders["train"], criterion, device, optimizer, scaler)
            validation_metrics = _run_epoch(model, loaders["validation"], criterion, device)
            scheduler.step(validation_metrics["loss"])
            learning_rate = optimizer.param_groups[0]["lr"]
            metrics = {
                "train_loss": train_metrics["loss"],
                "train_accuracy": train_metrics["accuracy"],
                "validation_loss": validation_metrics["loss"],
                "validation_accuracy": validation_metrics["accuracy"],
                "learning_rate": learning_rate,
            }
            history.append({"epoch": float(epoch), **metrics})
            for name, value in metrics.items():
                writer.add_scalar(name, value, epoch)

            save_checkpoint(checkpoint_dir / "last.pt", model, optimizer, scheduler, epoch, metrics, class_to_index)
            improved = validation_metrics["loss"] < stopper.best - stopper.min_delta
            should_stop = stopper.step(validation_metrics["loss"])
            if improved:
                best_epoch = epoch
                save_checkpoint(checkpoint_dir / "best.pt", model, optimizer, scheduler, epoch, metrics, class_to_index)

            print(
                f"Epoch {epoch:03d}/{epochs} | "
                f"train loss {train_metrics['loss']:.4f}, acc {train_metrics['accuracy']:.3f} | "
                f"val loss {validation_metrics['loss']:.4f}, acc {validation_metrics['accuracy']:.3f} | "
                f"lr {learning_rate:.2e}"
            )
            if should_stop:
                print(f"Early stopping at epoch {epoch}; best validation loss was {stopper.best:.4f}.")
                break
    finally:
        writer.close()

    best_checkpoint = torch.load(checkpoint_dir / "best.pt", map_location=device, weights_only=False)
    model.load_state_dict(best_checkpoint["model_state_dict"])
    test_metrics = _run_epoch(model, loaders["test"], criterion, device)
    print(f"Test loss {test_metrics['loss']:.4f} | test accuracy {test_metrics['accuracy']:.3f}")
    return {
        "device": str(device),
        "best_epoch": best_epoch,
        "best_validation_loss": stopper.best,
        "test_metrics": test_metrics,
        "history": history,
        "best_checkpoint": str(checkpoint_dir / "best.pt"),
    }
