"""Evaluation and visual reporting for trained wafer-defect models."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt
import numpy as np
import torch
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
    roc_auc_score,
    roc_curve,
)
from torch import nn
from torch.utils.data import DataLoader


def ordered_class_names(class_to_index: dict[str, int]) -> list[str]:
    """Return class names ordered by model-output index."""
    return [name for name, _ in sorted(class_to_index.items(), key=lambda item: item[1])]


def predict(model: nn.Module, loader: DataLoader, device: torch.device) -> tuple[np.ndarray, np.ndarray]:
    """Return integer targets and softmax probabilities for a complete loader."""
    model.eval()
    targets, probabilities = [], []
    with torch.no_grad():
        for images, labels in loader:
            logits = model(images.to(device, non_blocking=True))
            probabilities.append(torch.softmax(logits, dim=1).cpu().numpy())
            targets.append(labels.numpy())
    if not targets:
        raise ValueError("Test DataLoader produced no batches.")
    return np.concatenate(targets), np.concatenate(probabilities)


def evaluate_predictions(
    targets: np.ndarray,
    probabilities: np.ndarray,
    class_names: list[str],
    output_dir: str | Path,
) -> dict[str, Any]:
    """Compute classification metrics and save confusion-matrix and ROC plots."""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    labels = np.arange(len(class_names))
    predictions = probabilities.argmax(axis=1)
    precision_macro, recall_macro, f1_macro, _ = precision_recall_fscore_support(
        targets, predictions, labels=labels, average="macro", zero_division=0
    )
    precision_weighted, recall_weighted, f1_weighted, _ = precision_recall_fscore_support(
        targets, predictions, labels=labels, average="weighted", zero_division=0
    )
    report = classification_report(
        targets, predictions, labels=labels, target_names=class_names, zero_division=0, output_dict=True
    )
    metrics: dict[str, Any] = {
        "accuracy": float(accuracy_score(targets, predictions)),
        "precision_macro": float(precision_macro),
        "recall_macro": float(recall_macro),
        "f1_macro": float(f1_macro),
        "precision_weighted": float(precision_weighted),
        "recall_weighted": float(recall_weighted),
        "f1_weighted": float(f1_weighted),
        "classification_report": report,
    }

    matrix = confusion_matrix(targets, predictions, labels=labels)
    figure, axis = plt.subplots(figsize=(10, 8))
    ConfusionMatrixDisplay(matrix, display_labels=class_names).plot(
        ax=axis, cmap="Blues", values_format="d", colorbar=False
    )
    axis.set_title("WM-811K confusion matrix")
    figure.tight_layout()
    figure.savefig(output_dir / "confusion_matrix.png", dpi=180)
    plt.close(figure)

    figure, axis = plt.subplots(figsize=(9, 7))
    roc_aucs: dict[str, float] = {}
    for index, name in enumerate(class_names):
        binary_targets = (targets == index).astype(int)
        # AUC is undefined when this test split has no positive or no negative examples.
        if np.unique(binary_targets).size < 2:
            continue
        false_positive_rate, true_positive_rate, _ = roc_curve(binary_targets, probabilities[:, index])
        auc = roc_auc_score(binary_targets, probabilities[:, index])
        roc_aucs[name] = float(auc)
        axis.plot(false_positive_rate, true_positive_rate, label=f"{name} (AUC={auc:.3f})")
    axis.plot([0, 1], [0, 1], "k--", label="Chance")
    axis.set(xlim=(0, 1), ylim=(0, 1.05), xlabel="False positive rate", ylabel="True positive rate",
             title="One-vs-rest ROC curves")
    axis.legend(loc="lower right", fontsize=8)
    figure.tight_layout()
    figure.savefig(output_dir / "roc_curves.png", dpi=180)
    plt.close(figure)
    metrics["roc_auc_one_vs_rest"] = roc_aucs
    valid_auc_classes = [index for index in labels if np.unique(targets == index).size == 2]
    if len(valid_auc_classes) == len(class_names):
        if len(class_names) == 2:
            metrics["roc_auc_macro_ovr"] = float(
                roc_auc_score(targets, probabilities[:, 1])
            )
        else:
            metrics["roc_auc_macro_ovr"] = float(
                roc_auc_score(targets, probabilities, labels=labels, multi_class="ovr", average="macro")
            )

    (output_dir / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics
