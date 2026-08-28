import numpy as np

from src.evaluation import evaluate_predictions


def test_evaluation_writes_metrics_and_plots(tmp_path) -> None:
    targets = np.array([0, 1, 0, 1])
    probabilities = np.array([
        [0.9, 0.1], [0.1, 0.9], [0.7, 0.3], [0.4, 0.6],
    ])

    metrics = evaluate_predictions(targets, probabilities, ["Center", "Donut"], tmp_path)

    assert metrics["accuracy"] == 1.0
    assert (tmp_path / "metrics.json").is_file()
    assert (tmp_path / "confusion_matrix.png").is_file()
    assert (tmp_path / "roc_curves.png").is_file()
