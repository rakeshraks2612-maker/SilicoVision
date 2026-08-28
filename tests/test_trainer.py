from src.training.trainer import EarlyStopping


def test_early_stopping_resets_after_improvement() -> None:
    stopper = EarlyStopping(patience=2)

    assert not stopper.step(1.0)
    assert not stopper.step(1.1)
    assert not stopper.step(0.9)
    assert stopper.bad_epochs == 0
    assert not stopper.step(1.0)
    assert stopper.step(1.1)
