import pandas as pd
import numpy as np
import math
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, mean_squared_error

# Hardcoded absolute path anti-pattern (R003)
DATA_PATH = "/Users/admin/datasets/customer_churn_raw_2026.csv"

def run_churn_pipeline():
    # 1. Load data with timestamp/date columns (L003 Temporal Leakage)
    df = pd.read_csv(DATA_PATH)
    df["created_timestamp"] = pd.to_datetime(df["timestamp_col"])
    
    # 2. Target Column Feature Leakage (L004): target column 'churn' left inside X features
    X = df[["customer_id", "created_timestamp", "feature_1", "churn"]]
    y = df["churn"]
    
    # 3. Preprocessing Data Leakage (L001): fit_transform called on full dataset BEFORE splitting
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 4. Temporal Leakage (L003) & Missing Random State (R001): Random train_test_split on temporal data without seed
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.25)
    
    # 5. Missing Random State in Stochastic Models (R001)
    clf_rf = RandomForestClassifier(n_estimators=100)
    clf_rf.fit(X_train, y_train)
    
    clf_gb = GradientBoostingClassifier(n_estimators=50)
    clf_gb.fit(X_train, y_train)
    
    # 6. Evaluation on Training Data Anti-pattern (E001)
    train_predictions = clf_rf.predict(X_train)
    train_acc = accuracy_score(y_train, train_predictions)
    print(f"Training accuracy: {train_acc:.4f}")
    
    # 7. Metric Misuse (E003): Regression metric mean_squared_error evaluated on classification model
    preds = clf_gb.predict(X_test)
    mse_score = mean_squared_error(y_test, preds)
    print(f"Regression metric on Classifier: {mse_score:.4f}")
    
    return clf_rf, clf_gb

if __name__ == "__main__":
    run_churn_pipeline()
