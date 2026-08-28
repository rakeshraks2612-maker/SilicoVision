"""Loss functions for imbalanced wafer-defect classification."""

from __future__ import annotations

from collections.abc import Sequence

import torch
import torch.nn as nn
import torch.nn.functional as F


def inverse_frequency_class_weights(
    labels: Sequence[int] | torch.Tensor, num_classes: int
) -> torch.Tensor:
    """Return inverse-frequency weights normalized to mean one.

    Apply this to training labels only, so validation and test information
    cannot influence the optimization objective.
    """
    targets = torch.as_tensor(labels, dtype=torch.long)
    if targets.numel() == 0:
        raise ValueError("labels must not be empty.")
    if targets.min() < 0 or targets.max() >= num_classes:
        raise ValueError("labels contain values outside [0, num_classes).")
    counts = torch.bincount(targets, minlength=num_classes).to(torch.float32)
    if torch.any(counts == 0):
        raise ValueError("Each class must have at least one training example to compute weights.")
    weights = targets.numel() / (num_classes * counts)
    return weights / weights.mean()


class WeightedFocalLoss(nn.Module):
    r"""Weighted focal loss for multi-class logits.

    For an example with true class ``y`` and predicted probability ``p_t`` for
    that class, the loss is ``-alpha_y * (1 - p_t)^gamma * log(p_t)``.  Class
    weights ``alpha`` address frequency imbalance; ``gamma`` down-weights easy,
    high-confidence examples so optimization focuses on hard mistakes.
    """

    def __init__(
        self,
        class_weights: Sequence[float] | torch.Tensor | None = None,
        gamma: float = 2.0,
        reduction: str = "mean",
    ) -> None:
        super().__init__()
        if gamma < 0:
            raise ValueError("gamma must be non-negative.")
        if reduction not in {"none", "mean", "sum"}:
            raise ValueError("reduction must be 'none', 'mean', or 'sum'.")
        weights = torch.as_tensor(class_weights, dtype=torch.float32) if class_weights is not None else torch.empty(0)
        if weights.numel() and (weights.ndim != 1 or torch.any(weights <= 0)):
            raise ValueError("class_weights must be a one-dimensional positive sequence.")
        self.register_buffer("class_weights", weights)
        self.gamma = gamma
        self.reduction = reduction

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        if logits.ndim != 2:
            raise ValueError("logits must have shape [batch_size, num_classes].")
        if targets.ndim != 1 or targets.shape[0] != logits.shape[0]:
            raise ValueError("targets must have shape [batch_size].")
        targets = targets.long()
        if targets.numel() == 0:
            raise ValueError("targets must not be empty.")
        if targets.min() < 0 or targets.max() >= logits.shape[1]:
            raise ValueError("targets contain a class index outside logits.")
        if self.class_weights.numel() not in {0, logits.shape[1]}:
            raise ValueError("class_weights length must equal the number of logit classes.")

        log_probabilities = F.log_softmax(logits, dim=1)
        log_pt = log_probabilities.gather(1, targets.unsqueeze(1)).squeeze(1)
        pt = log_pt.exp()
        focal_factor = (1.0 - pt).pow(self.gamma)
        alpha = self.class_weights[targets] if self.class_weights.numel() else torch.ones_like(pt)
        losses = -alpha * focal_factor * log_pt

        if self.reduction == "none":
            return losses
        if self.reduction == "sum":
            return losses.sum()
        # Match CrossEntropyLoss(weight=..., reduction="mean") when gamma=0.
        return losses.sum() / alpha.sum().clamp_min(torch.finfo(losses.dtype).eps)
