import argparse
from pathlib import Path

import joblib
from sklearn.model_selection import train_test_split

from .config import DEFAULT_MODEL_PATH
from .model import build_model_pipeline, evaluate_model
from .preprocessing import build_preprocessor, load_dataset, split_features_target


def train_and_save_model(data_path: str, model_path: str):
    """Train model, evaluate it, print metrics, and persist artifact."""
    df = load_dataset(data_path)
    X, y = split_features_target(df)

    if y.nunique() < 2:
        raise ValueError("Training requires at least two classes in fraud_flag.")

    min_class_count = int(y.value_counts().min())
    stratify_target = y if min_class_count >= 2 else None

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify_target,
    )

    preprocessor = build_preprocessor()
    model_pipeline = build_model_pipeline(preprocessor)
    model_pipeline.fit(X_train, y_train)

    metrics = evaluate_model(model_pipeline, X_test, y_test)

    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall: {metrics['recall']:.4f}")
    print(f"ROC-AUC: {metrics['roc_auc']:.4f}")
    print("Confusion Matrix:")
    for row in metrics["confusion_matrix"]:
        print(row)

    output_path = Path(model_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model_pipeline, output_path)
    print(f"Model saved to: {output_path}")


def parse_args():
    parser = argparse.ArgumentParser(description="Train fraud detection model")
    parser.add_argument("--data_path", required=True, help="Path to CSV dataset")
    parser.add_argument(
        "--model_path",
        default=str(DEFAULT_MODEL_PATH),
        help="Path to save trained model artifact",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    train_and_save_model(args.data_path, args.model_path)
