import io
import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import config
from src.preprocessing import preprocess_text

LABEL_ORDER = ["critical", "high", "medium", "low"]


def _load_df(csv_path: str) -> pd.DataFrame:
    # Strip leading junk lines (ticket_sample.csv has a blank `,,,,,,` first row)
    with open(csv_path, encoding="utf-8") as f:
        lines = f.readlines()
    while lines and not lines[0].replace(",", "").strip():
        lines = lines[1:]
    df = pd.read_csv(io.StringIO("".join(lines)), on_bad_lines="skip")

    # Normalise label column — accept label / human_label / priority
    if "label" not in df.columns:
        if "human_label" in df.columns:
            df = df.rename(columns={"human_label": "label"})
        elif "priority" in df.columns:
            df = df.rename(columns={"priority": "label"})

    df["label"] = df["label"].astype(str).str.strip().str.lower()
    df = df.dropna(subset=["title", "label"])
    df = df[df["label"].isin(LABEL_ORDER)].reset_index(drop=True)
    return df


def train(csv_path: str = "data/processed/train.csv"):
    # Fall back to source if augmented file doesn't exist yet
    if not os.path.exists(csv_path):
        fallback = "data/processed/ticket_sample.csv"
        print(f"Warning: {csv_path} not found — falling back to {fallback}")
        csv_path = fallback

    df = _load_df(csv_path)
    print(f"Loaded {len(df)} rows from {csv_path}")
    print("Label distribution:", df["label"].value_counts().to_dict())

    df["text"] = df.apply(
        lambda r: preprocess_text(r["title"], r.get("description", "")), axis=1
    )

    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        min_df=2,
        sublinear_tf=True,
    )
    X = vectorizer.fit_transform(df["text"])

    X_train, X_test, idx_train, idx_test = train_test_split(
        X, df.index, test_size=0.2, random_state=42, stratify=df["label"]
    )

    priority_model = LogisticRegression(
        max_iter=1000,
        random_state=42,
        solver="lbfgs",
        C=1.0,
        class_weight="balanced",
    )
    priority_model.fit(X_train, df.loc[idx_train, "label"])

    os.makedirs(config.MODEL_DIR, exist_ok=True)
    joblib.dump(vectorizer, os.path.join(config.MODEL_DIR, "vectorizer.pkl"))
    joblib.dump(priority_model, os.path.join(config.MODEL_DIR, "priority_model.pkl"))

    classes = list(priority_model.classes_)
    train_acc = (priority_model.predict(X_train) == df.loc[idx_train, "label"].values).mean()
    print(f"Training complete — classes: {classes}, train accuracy: {train_acc:.1%}")
    print(f"Artifacts saved to {config.MODEL_DIR}/")

    return {
        "vectorizer": vectorizer,
        "priority_model": priority_model,
        "X_test": X_test,
        "idx_test": idx_test,
        "df": df,
    }
