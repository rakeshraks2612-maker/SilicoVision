import numpy as np

from src.evaluation.inference import preprocess_wafer_array


def test_raw_wafer_map_is_preprocessed_for_resnet() -> None:
    raw_map = np.array([[0, 1], [2, 1]], dtype=np.uint8)

    tensor = preprocess_wafer_array(raw_map)

    assert tensor.shape == (1, 3, 224, 224)
    assert float(tensor.min()) >= -2.2
    assert float(tensor.max()) <= 2.7
