"""EfficientNet-B2 transfer-learning model for WM-811K."""

from __future__ import annotations

import torch.nn as nn
from torchvision.models import EfficientNet_B2_Weights, efficientnet_b2


def build_resnet18(
    num_classes: int = 8,
    pretrained: bool = True,
    dropout: float = 0.3,
    freeze_backbone: bool = False,
) -> nn.Module:
    if num_classes < 2:
        raise ValueError("num_classes must be at least 2.")

    if not 0 <= dropout < 1:
        raise ValueError("dropout must be in [0, 1).")

    weights = EfficientNet_B2_Weights.DEFAULT if pretrained else None
    model = efficientnet_b2(weights=weights)

    if freeze_backbone:
        for parameter in model.features.parameters():
            parameter.requires_grad = False

    in_features = model.classifier[1].in_features

    model.classifier = nn.Sequential(
        nn.Dropout(p=dropout),
        nn.Linear(in_features, num_classes),
    )

    return model