"""
Customer Churn Prediction & Lifetime Value ML Pipeline
------------------------------------------------------
This script demonstrates an end-to-end Machine Learning pipeline
including data preprocessing, feature engineering, model training,
and cross-validation evaluation on customer telecom records.
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler, RobustScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report

def load_data(filepath: str = "customer_churn_data.csv") -> pd.DataFrame:
    """Load customer dataset or generate synthetic telecom data if file not found."""
    if os.path.exists(filepath):
        return pd.read_csv(filepath)
    
    # Generate realistic telecom customer dataset
    np.random.seed(42)
    n_samples = 1500
    
    data = {
        "customer_id": [f"CUST_{1000 + i}" for i in range(n_samples)],
        "account_length_months": np.random.randint(1, 72, n_samples),
        "monthly_charges": np.random.uniform(20.0, 120.0, n_samples),
        "total_charges": np.random.uniform(100.0, 8000.0, n_samples),
        "contract_type": np.random.choice(["Month-to-month", "One year", "Two year"], n_samples, p=[0.5, 0.3, 0.2]),
        "payment_method": np.random.choice(["Electronic check", "Mailed check", "Bank transfer", "Credit card"], n_samples),
        "tech_support": np.random.choice(["Yes", "No", "No internet"], n_samples, p=[0.4, 0.4, 0.2]),
        "customer_service_calls": np.random.poisson(1.5, n_samples),
        "churn": np.random.choice([0, 1], n_samples, p=[0.74, 0.26])
    }
    
    df = pd.DataFrame(data)
    # Introduce sparse missing values in total_charges
    missing_mask = np.random.rand(n_samples) < 0.05
    df.loc[missing_mask, "total_charges"] = np.nan
    return df

def run_pipeline():
    print("=" * 60)
    print("TELECOM CUSTOMER CHURN MACHINE LEARNING PIPELINE")
    print("=" * 60)
    
    # 1. Ingestion
    df = load_data()
    print(f"[*] Ingested dataset: {df.shape[0]} records, {df.shape[1]} columns")
    
    # 2. Feature Selection & Target Separation
    target_column = "churn"
    identifier_column = "customer_id"
    
    X = df.drop(columns=[target_column, identifier_column])
    y = df[target_column]
    
    # Identify numeric and categorical columns
    numeric_features = ["account_length_months", "monthly_charges", "total_charges", "customer_service_calls"]
    categorical_features = ["contract_type", "payment_method", "tech_support"]
    
    # 3. Partitioning: Train / Test Split First (Strict Data Isolation)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, 
        test_size=0.20, 
        random_state=42, 
        stratify=y
    )
    print(f"[*] Train set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples")
    
    # 4. Building Clean Scikit-Learn Preprocessing Pipelines
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value="missing")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features)
        ]
    )
    
    # 5. Model Architecture & Pipeline Composition
    model_pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=150, 
            max_depth=8, 
            min_samples_split=5, 
            random_state=42
        ))
    ])
    
    # 6. Model Fitting (Fitted strictly on Training Partition)
    print("[*] Training Random Forest model with encapsulated preprocessing...")
    model_pipeline.fit(X_train, y_train)
    
    # 7. Stratified 5-Fold Cross-Validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model_pipeline, X_train, y_train, cv=cv, scoring="roc_auc")
    print(f"[*] 5-Fold CV ROC-AUC Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    
    # 8. Unseen Out-of-Sample Test Evaluation
    y_pred = model_pipeline.predict(X_test)
    y_pred_proba = model_pipeline.predict_proba(X_test)[:, 1]
    
    print("\n" + "-" * 40)
    print("FINAL TEST SET EVALUATION METRICS:")
    print("-" * 40)
    print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall:    {recall_score(y_test, y_pred):.4f}")
    print(f"F1-Score:  {f1_score(y_test, y_pred):.4f}")
    print(f"ROC-AUC:   {roc_auc_score(y_test, y_pred_proba):.4f}")
    print("\nDetailed Classification Report:\n")
    print(classification_report(y_test, y_pred, target_names=["Retained (0)", "Churned (1)"]))

if __name__ == "__main__":
    run_pipeline()
