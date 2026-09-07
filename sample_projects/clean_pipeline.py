"""Clean classification pipeline with zero data leakage and full reproducibility."""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


def execute_pipeline() -> float:
    """Execute end-to-end clean training and evaluation pipeline."""
    # 1. Global seed initialization
    np.random.seed(42)

    # 2. Load dataset using relative path
    dataset = pd.read_csv("sample_projects/clean_customer_data.csv")

    # 3. Features and label extraction
    feature_columns = ["age", "account_balance", "tenure", "transaction_count", "satisfaction_score"]
    features = dataset[feature_columns]
    labels = dataset["churned"]

    # 4. Partition dataset prior to any transformations
    features_train, features_test, labels_train, labels_test = train_test_split(
        features,
        labels,
        test_size=0.2,
        random_state=42
    )

    # 5. Fit scaler on training partition only
    scaler = StandardScaler()
    scaled_train = scaler.fit_transform(features_train)
    scaled_test = scaler.transform(features_test)

    # 6. Initialize and fit classifier with explicit random_state
    classifier = RandomForestClassifier(n_estimators=50, random_state=42)
    classifier.fit(scaled_train, labels_train)

    # 7. Evaluate exclusively on out-of-sample test partition
    predictions = classifier.predict(scaled_test)
    accuracy = float(accuracy_score(labels_test, predictions))
    print(f"Validation Accuracy: {accuracy:.4f}")
    return accuracy


if __name__ == "__main__":
    execute_pipeline()
