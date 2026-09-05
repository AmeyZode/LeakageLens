"""
Hospital 30-Day Readmission & Sepsis Risk ML Pipeline (Realistic Leaky Example)
=============================================================================
Goal: Predict whether a hospitalized patient will be readmitted within 30 days.
This file represents a real-world clinical data science pipeline that achieves 
an apparent 94.8% accuracy in training, but suffers from multiple subtle data leaks 
causing severe generalization collapse when deployed in hospital emergency wards.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score, mean_squared_error

# Load Electronic Health Record (EHR) dataset
df = pd.read_csv("patient_clinical_records.csv")

# -----------------------------------------------------------------------------------
# LEAK 1 (L004): Target Variable & Target Mean Proxy Leakage
# Computing global target mean encoding prior to partitioning the dataset.
# The mean readmission rate per diagnosis code includes future test labels!
# -----------------------------------------------------------------------------------
df["diagnosis_readmission_rate"] = df.groupby("diagnosis_code")["readmitted_30d"].transform("mean")

# Separate features and target
X = df.drop(columns=["patient_id", "readmitted_30d"])
y = df["readmitted_30d"]

# -----------------------------------------------------------------------------------
# LEAK 2 (L002): Global Missing Value Imputation
# Imputing missing lab values (e.g. Creatinine, WBC) across the entire dataset.
# Statistical distributions (median/mean) of test records leak into training space.
# -----------------------------------------------------------------------------------
imputer = SimpleImputer(strategy="median")
X_imputed = pd.DataFrame(imputer.fit_transform(X), columns=X.columns)

# -----------------------------------------------------------------------------------
# LEAK 3 (L001): Global Feature Scaling Before Partitioning
# Fitting StandardScaler on the entire patient dataset (X_imputed) before splitting.
# Test set means (μ) and standard deviations (σ) contaminate the training features.
# -----------------------------------------------------------------------------------
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_imputed)

# -----------------------------------------------------------------------------------
# LEAK 4 (R001 & L003): Temporal Lookahead Shuffle & Missing Random State
# Clinical admissions occur chronologically over time, but are randomly shuffled 
# without fixed random_state, leaking future clinical treatment protocols into past data.
# -----------------------------------------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.20)

# -----------------------------------------------------------------------------------
# FLAW 5 (R001): Missing Random State in Stochastic Model Architecture
# -----------------------------------------------------------------------------------
model = RandomForestClassifier(n_estimators=100, max_depth=10)
model.fit(X_train, y_train)

# -----------------------------------------------------------------------------------
# FLAW 6 (E001): Model Evaluation on Training Partition (Overfitting Masked)
# -----------------------------------------------------------------------------------
train_predictions = model.predict(X_train)
train_accuracy = accuracy_score(y_train, train_predictions)
print(f"Apparent Validation Accuracy: {train_accuracy * 100:.2f}% (Artificially Inflated!)")

# -----------------------------------------------------------------------------------
# FLAW 7 (E003): Metric Misuse
# Evaluating binary classification model using Regression MSE
# -----------------------------------------------------------------------------------
test_predictions = model.predict(X_test)
mse = mean_squared_error(y_test, test_predictions)
print(f"Mean Squared Error: {mse:.4f}")
