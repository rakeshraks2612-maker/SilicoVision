import torch
import torch.nn.functional as functional

from src.training import WeightedFocalLoss, inverse_frequency_class_weights


def test_gamma_zero_matches_weighted_cross_entropy() -> None:
    logits = torch.tensor([[2.0, 0.2, -1.0], [0.5, 1.2, 0.1]])
    targets = torch.tensor([0, 2])
    weights = torch.tensor([1.0, 2.0, 3.0])

    focal = WeightedFocalLoss(weights, gamma=0.0)(logits, targets)
    cross_entropy = functional.cross_entropy(logits, targets, weight=weights)

    assert torch.allclose(focal, cross_entropy)


def test_inverse_frequency_weights_upweight_rare_class() -> None:
    weights = inverse_frequency_class_weights([0, 0, 0, 1], num_classes=2)

    assert weights[1] > weights[0]
