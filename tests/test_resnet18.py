import torch

from src.models import build_resnet18


def test_resnet18_returns_logits_for_each_wafer_class() -> None:
    model = build_resnet18(num_classes=8, pretrained=False)
    logits = model(torch.randn(2, 3, 224, 224))

    assert logits.shape == (2, 8)


def test_frozen_resnet18_leaves_new_head_trainable() -> None:
    model = build_resnet18(pretrained=False, freeze_backbone=True)

    assert not model.features[0][0].weight.requires_grad
    assert model.classifier[1].weight.requires_grad
