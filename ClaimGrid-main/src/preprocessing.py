import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from .config import FEATURE_COLUMNS, TARGET_COLUMN


def load_dataset(csv_path: str) -> pd.DataFrame:
    """Load dataset from CSV and validate required columns."""
    df = pd.read_csv(csv_path)

    required_columns = set(FEATURE_COLUMNS + [TARGET_COLUMN])
    missing_columns = required_columns.difference(df.columns)
    if missing_columns:
        raise ValueError(f"Missing required columns: {sorted(missing_columns)}")

    return df


def build_preprocessor() -> ColumnTransformer:
    """Create preprocessing pipeline with imputation and scaling."""
    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[("num", numeric_transformer, FEATURE_COLUMNS)],
        remainder="drop",
    )

    return preprocessor


def split_features_target(df: pd.DataFrame):
    """Split DataFrame into X and y."""
    X = df[FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMN].astype(int)
    return X, y
