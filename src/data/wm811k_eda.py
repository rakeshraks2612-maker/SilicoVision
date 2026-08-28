"""Reproducible exploratory data analysis for the WM-811K wafer-map dataset.

Expected input: the commonly distributed ``LSWMD.pkl`` file, whose columns are
``waferMap``, ``dieSize``, ``lotName``, ``waferIndex``, ``trianTestLabel`` and
``failureType``.  Wafer-map values conventionally mean 0=outside wafer,
1=normal die, and 2=defective die.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from matplotlib.colors import ListedColormap


PATTERN_CLASSES = [
    "Center", "Donut", "Edge-Loc", "Edge-Ring", "Loc", "Random",
    "Scratch", "Near-full",
]
MAP_COLORS = ListedColormap(["#f7f7f7", "#74a9cf", "#d7301f"])


def scalar_label(value: Any) -> str | None:
    """Convert WM-811K's nested MATLAB label arrays to a Python label."""
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return None
    array = np.asarray(value).ravel()
    if array.size == 0:
        return None
    label = str(array[0]).strip()
    return None if label.lower() in {"", "nan", "none"} else label


def save_plot(path: Path) -> None:
    plt.tight_layout()
    plt.savefig(path, dpi=180, bbox_inches="tight")
    plt.close()


def bar_chart(series: pd.Series, title: str, ylabel: str, path: Path) -> None:
    counts = series.value_counts(dropna=False)
    labels = ["Unlabeled" if pd.isna(x) else str(x) for x in counts.index]
    plt.figure(figsize=(11, 5))
    ax = sns.barplot(x=labels, y=counts.values, color="#2563eb")
    ax.set(title=title, xlabel="Category", ylabel=ylabel)
    ax.tick_params(axis="x", rotation=35)
    for index, count in enumerate(counts.values):
        ax.text(index, count, f"{count:,}", ha="center", va="bottom", fontsize=8)
    save_plot(path)


def map_gallery(frame: pd.DataFrame, output: Path, samples_per_class: int = 6) -> None:
    """Save representative maps for every labelled failure-pattern class."""
    classes = [label for label in PATTERN_CLASSES if label in set(frame["failure_label"])]
    if not classes:
        return
    figure, axes = plt.subplots(len(classes), samples_per_class,
                                figsize=(2.1 * samples_per_class, 2.1 * len(classes)))
    axes = np.atleast_2d(axes)
    rng = np.random.default_rng(42)
    for row, label in enumerate(classes):
        candidates = frame.loc[frame["failure_label"] == label]
        indices = rng.choice(candidates.index, size=min(samples_per_class, len(candidates)), replace=False)
        for column, axis in enumerate(axes[row]):
            axis.set_axis_off()
            if column < len(indices):
                axis.imshow(frame.at[indices[column], "waferMap"], cmap=MAP_COLORS, vmin=0, vmax=2)
                if column == 0:
                    axis.set_title(label, loc="left", fontsize=10, fontweight="bold")
    figure.suptitle("Representative WM-811K failure maps (white=outside, blue=normal, red=defect)", y=1.01)
    save_plot(output)


def analyze(dataset_path: Path, output_dir: Path) -> dict[str, Any]:
    """Load WM-811K, create EDA artifacts, and return its summary."""
    if not dataset_path.is_file():
        raise FileNotFoundError(
            f"Dataset not found: {dataset_path}. Place LSWMD.pkl in dataset/ or pass --input."
        )
    output_dir.mkdir(parents=True, exist_ok=True)
    frame = pd.read_pickle(dataset_path)
    required = {"waferMap", "failureType"}
    missing = required.difference(frame.columns)
    if missing:
        raise ValueError(f"Not a standard WM-811K file; missing columns: {sorted(missing)}")

    frame = frame.copy()
    frame["failure_label"] = frame["failureType"].map(scalar_label)
    frame["map_shape"] = frame["waferMap"].map(lambda wafer: tuple(np.asarray(wafer).shape))
    frame["map_rows"] = frame["map_shape"].map(lambda shape: shape[0])
    frame["map_cols"] = frame["map_shape"].map(lambda shape: shape[1])
    frame["defect_ratio"] = frame["waferMap"].map(
        lambda wafer: float((np.asarray(wafer) == 2).sum() / max((np.asarray(wafer) > 0).sum(), 1))
    )

    bar_chart(frame["failure_label"], "All wafer-map label availability and classes", "Number of wafers",
              output_dir / "01_all_label_distribution.png")
    patterns = frame.loc[frame["failure_label"].isin(PATTERN_CLASSES)]
    bar_chart(patterns["failure_label"], "Failure-pattern class distribution", "Number of pattern wafers",
              output_dir / "02_pattern_class_distribution.png")
    if "trianTestLabel" in frame:
        frame["split_label"] = frame["trianTestLabel"].map(scalar_label)
        bar_chart(frame["split_label"], "Provided train/test split distribution", "Number of wafers",
                  output_dir / "03_train_test_distribution.png")

    dimensions = frame["map_shape"].value_counts().head(25)
    plt.figure(figsize=(12, 6))
    sns.barplot(x=[f"{r}×{c}" for r, c in dimensions.index], y=dimensions.values, color="#0f766e")
    plt.title("25 most common wafer-map dimensions")
    plt.xlabel("Map dimensions (rows × columns)")
    plt.ylabel("Number of wafers")
    plt.xticks(rotation=55, ha="right")
    save_plot(output_dir / "04_map_dimensions.png")

    plt.figure(figsize=(10, 5))
    sns.histplot(data=patterns, x="defect_ratio", hue="failure_label", bins=40,
                 element="step", stat="density", common_norm=False)
    plt.title("Defect-ratio distribution by failure pattern")
    plt.xlabel("Defective dies / valid dies")
    save_plot(output_dir / "05_defect_ratio_by_class.png")

    if "lotName" in frame:
        lot_sizes = frame.groupby("lotName", dropna=True).size()
        plt.figure(figsize=(10, 5))
        sns.histplot(lot_sizes, bins=30, color="#7c3aed")
        plt.title("Wafer maps per lot")
        plt.xlabel("Number of maps in a lot")
        plt.ylabel("Number of lots")
        save_plot(output_dir / "06_lot_size_distribution.png")

    map_gallery(patterns, output_dir / "07_failure_map_gallery.png")
    frame[["failure_label", "map_shape", "map_rows", "map_cols", "defect_ratio"]].describe(include="all").to_csv(
        output_dir / "eda_numeric_and_shape_summary.csv"
    )
    frame["failure_label"].value_counts(dropna=False).rename_axis("failure_label").to_csv(
        output_dir / "class_counts.csv", header=["count"]
    )
    summary = {
        "dataset": str(dataset_path),
        "rows": int(len(frame)),
        "columns": list(frame.columns),
        "unique_lots": int(frame["lotName"].nunique()) if "lotName" in frame else None,
        "unique_map_dimensions": int(frame["map_shape"].nunique()),
        "labeled_wafers": int(frame["failure_label"].notna().sum()),
        "pattern_wafers": int(len(patterns)),
        "unlabeled_wafers": int(frame["failure_label"].isna().sum()),
        "class_counts": {str(k): int(v) for k, v in frame["failure_label"].value_counts(dropna=False).items()},
    }
    (output_dir / "eda_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Run complete EDA for WM-811K.")
    parser.add_argument("--input", type=Path, default=Path("dataset/LSWMD.pkl"))
    parser.add_argument("--output", type=Path, default=Path("outputs/eda"))
    args = parser.parse_args()
    summary = analyze(args.input, args.output)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
