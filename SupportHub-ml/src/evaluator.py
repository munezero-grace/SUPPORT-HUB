import json
import os
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    classification_report,
    confusion_matrix,
)

LABEL_ORDER = ["critical", "high", "medium", "low"]


def evaluate(training_artifacts: dict):
    df            = training_artifacts["df"]
    X_test        = training_artifacts["X_test"]
    idx_test      = training_artifacts["idx_test"]
    priority_model = training_artifacts["priority_model"]

    y_true = df.loc[idx_test, "label"].values
    y_pred = priority_model.predict(X_test)

    accuracy  = round(accuracy_score(y_true, y_pred), 4)
    f1_macro  = round(f1_score(y_true, y_pred, average="macro", zero_division=0), 4)
    f1_weighted = round(f1_score(y_true, y_pred, average="weighted", zero_division=0), 4)
    cls_report  = classification_report(y_true, y_pred, output_dict=True, zero_division=0)
    conf_matrix = confusion_matrix(y_true, y_pred, labels=LABEL_ORDER).tolist()

    report = {
        "priority_model": {
            "test_size":          len(y_true),
            "accuracy":           accuracy,
            "f1_macro":           f1_macro,
            "f1_weighted":        f1_weighted,
            "classification_report": cls_report,
            "confusion_matrix":   conf_matrix,
            "confusion_labels":   LABEL_ORDER,
        }
    }

    os.makedirs("data", exist_ok=True)
    out_path = "data/evaluation_report.json"
    with open(out_path, "w") as f:
        json.dump(report, f, indent=2)

    # Human-readable summary
    print("\n" + "=" * 55)
    print("PRIORITY MODEL EVALUATION")
    print("=" * 55)
    print(f"  Test set size : {len(y_true)}")
    print(f"  Accuracy      : {accuracy:.1%}")
    print(f"  F1 macro      : {f1_macro:.4f}")
    print(f"  F1 weighted   : {f1_weighted:.4f}")
    print()
    print("  Per-class breakdown:")
    for lbl in LABEL_ORDER:
        if lbl in cls_report:
            p  = cls_report[lbl]["precision"]
            r  = cls_report[lbl]["recall"]
            f1 = cls_report[lbl]["f1-score"]
            n  = int(cls_report[lbl]["support"])
            print(f"    {lbl:8s}  precision={p:.2f}  recall={r:.2f}  f1={f1:.2f}  n={n}")
    print()
    print("  Confusion matrix (rows=actual, cols=predicted):")
    header = "  " + "".join(f"{l:10s}" for l in LABEL_ORDER)
    print(header)
    for lbl, row in zip(LABEL_ORDER, conf_matrix):
        print(f"  {lbl:8s}" + "".join(f"{v:10d}" for v in row))
    print("=" * 55)
    print(f"\nReport saved to {out_path}")

    return report
