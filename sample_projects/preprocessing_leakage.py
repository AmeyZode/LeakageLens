import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

df = pd.read_csv("data.csv")
X = df.drop(columns=["target"])
y = df["target"]

# Scaling before train_test_split (Critical Preprocessing Leakage)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split missing random_state (Major Reproducibility Issue)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y)

# Estimator missing random_state (Major Reproducibility Issue)
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Evaluating on training data and missing test evaluation (Major Evaluation Issue)
train_acc = model.score(X_train, y_train)
print(f"Train accuracy: {train_acc}")
