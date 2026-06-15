# LeakageLens Pipeline Audit Report
## Health Score: **0/100** (CRITICAL)

### Summary of Findings
- **Critical Issues (Leakage):** 2
- **Major Issues (Reproducibility & Evaluation):** 7
- **Minor Issues (Code Quality):** 1

---

## Detailed Findings

### 1. Preprocessing Leakage [CRITICAL]
- **File:** `C:\Users\admin\OneDrive\Desktop\code\LeakageLens\sample_projects\leaky_notebook.ipynb`
- **Line Number:** 14
- **Issue description:** Detected preprocessing function 'fit_transform' on variable 'X' at line 14 before train-test split at line 17. This leaks test set statistical properties (like mean or variance) into training.

**Code Context:**
```python
# line 14
[Cell 2, Line 8] scaler = StandardScaler()
```

#### AI Recommendation Details
- **Explanation:** Preprocessing (scaling/transformation) was fit on the whole dataset (or before the train-test split) instead of only on the training set. This leaks information from the test/validation set into the training phase.
- **Risk:** Over-optimistic validation metrics (optimistic bias). The model performs well in evaluation because it has already 'seen' test set properties like mean or variance, but its real-world performance will be lower.
- **Suggested Fix:** Split the dataset into training and testing parts first. Fit your preprocessor (e.g. StandardScaler) strictly on the training set, and then transform both training and testing sets.

**Corrected Code snippet:**
```python
# Split data first
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# Fit ONLY on train data
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
```
- **Best Practice:** Never let test or validation data influence any part of the training pipeline, including feature scaling, imputing missing values, or dimensionality reduction.

---

### 2. Missing random_state [MAJOR]
- **File:** `C:\Users\admin\OneDrive\Desktop\code\LeakageLens\sample_projects\leaky_notebook.ipynb`
- **Line Number:** 17
- **Issue description:** Detected 'train_test_split' call at line 17 missing a 'random_state' or 'seed' argument. This will lead to non-reproducible dataset splits or model initializations.

**Code Context:**
```python
# line 17
[Cell 2, Line 11] # Split missing random_state (Major Reproducibility Issue)
```

#### AI Recommendation Details
- **Explanation:** Random state or seed is not configured for a randomized operation (such as train-test split or model training).
- **Risk:** Non-reproducible pipeline. Every run will produce slightly different data splits, model initializations, and evaluation scores, making debugging difficult.
- **Suggested Fix:** Pass a fixed integer (e.g. 42) to the random_state or seed parameter.

**Corrected Code snippet:**
```python
# Add random_state to split or model
X_train, X_test = train_test_split(X, random_state=42)
model = RandomForestClassifier(random_state=42)
```
- **Best Practice:** Set fixed seeds for all stochastic elements to ensure reproducibility across machines and runs.

---

### 3. Missing Global Seed [MAJOR]
- **File:** `C:\Users\admin\OneDrive\Desktop\code\LeakageLens\sample_projects\leaky_notebook.ipynb`
- **Line Number:** 1
- **Issue description:** No global random seed initialization was detected in this file. Without global seeds for numpy, random, or deep learning frameworks, operations might not be fully reproducible.

**Code Context:**
```python
# line 1
[Cell 1, Line 1] import pandas as pd
```

#### AI Recommendation Details
- **Explanation:** No global seed initialization was detected for numpy, random, or deep learning libraries.
- **Risk:** Implicit randomness in libraries can lead to non-deterministic execution in random number generators.
- **Suggested Fix:** Initialize global seeds at the entry point of your script or notebook.

**Corrected Code snippet:**
```python
import random
import numpy as np
random.seed(42)
np.random.seed(42)
```
- **Best Practice:** Establish a global seed setup block at the top of your scripts to ground all downstream random generators.

---

### 4. Hardcoded Absolute Path [MAJOR]
- **File:** `C:\Users\admin\OneDrive\Desktop\code\LeakageLens\sample_projects\leaky_notebook.ipynb`
- **Line Number:** 5
- **Issue description:** Detected hardcoded absolute path 'C:\Users\admin\dataset.csv' at line 5. Absolute paths prevent reproducibility on different execution environments.

**Code Context:**
```python
# line 5
[Cell 1, Line 5] df = pd.read_csv("C:\\Users\\admin\\dataset.csv")
```

#### AI Recommendation Details
- **Explanation:** Code contains a hardcoded absolute file path.
- **Risk:** The script will crash or fail to find datasets if run on another computer, CI/CD runner, or collaborator environment.
- **Suggested Fix:** Use relative paths based on the script location, or configure paths using environment variables/config files.

**Corrected Code snippet:**
```python
import os
BASE_DIR = os.path.dirname(__file__)
data_path = os.path.join(BASE_DIR, 'data', 'dataset.csv')
df = pd.read_csv(data_path)
```
- **Best Practice:** Develop pipelines to be portable by referencing datasets relative to the project root directory.

---

### 5. Preprocessing Leakage [CRITICAL]
- **File:** `C:\Users\admin\OneDrive\Desktop\code\LeakageLens\sample_projects\preprocessing_leakage.py`
- **Line Number:** 13
- **Issue description:** Detected preprocessing function 'fit_transform' on variable 'X' at line 13 before train-test split at line 16. This leaks test set statistical properties (like mean or variance) into training.

**Code Context:**
```python
# line 13
X_scaled = scaler.fit_transform(X)
```

#### AI Recommendation Details
- **Explanation:** Preprocessing (scaling/transformation) was fit on the whole dataset (or before the train-test split) instead of only on the training set. This leaks information from the test/validation set into the training phase.
- **Risk:** Over-optimistic validation metrics (optimistic bias). The model performs well in evaluation because it has already 'seen' test set properties like mean or variance, but its real-world performance will be lower.
- **Suggested Fix:** Split the dataset into training and testing parts first. Fit your preprocessor (e.g. StandardScaler) strictly on the training set, and then transform both training and testing sets.

**Corrected Code snippet:**
```python
# Split data first
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# Fit ONLY on train data
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
```
- **Best Practice:** Never let test or validation data influence any part of the training pipeline, including feature scaling, imputing missing values, or dimensionality reduction.

---

### 6. Missing random_state [MAJOR]
- **File:** `C:\Users\admin\OneDrive\Desktop\code\LeakageLens\sample_projects\preprocessing_leakage.py`
- **Line Number:** 16
- **Issue description:** Detected 'train_test_split' call at line 16 missing a 'random_state' or 'seed' argument. This will lead to non-reproducible dataset splits or model initializations.

**Code Context:**
```python
# line 16
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y)
```

#### AI Recommendation Details
- **Explanation:** Random state or seed is not configured for a randomized operation (such as train-test split or model training).
- **Risk:** Non-reproducible pipeline. Every run will produce slightly different data splits, model initializations, and evaluation scores, making debugging difficult.
- **Suggested Fix:** Pass a fixed integer (e.g. 42) to the random_state or seed parameter.

**Corrected Code snippet:**
```python
# Add random_state to split or model
X_train, X_test = train_test_split(X, random_state=42)
model = RandomForestClassifier(random_state=42)
```
- **Best Practice:** Set fixed seeds for all stochastic elements to ensure reproducibility across machines and runs.

---

### 7. Missing random_state [MAJOR]
- **File:** `C:\Users\admin\OneDrive\Desktop\code\LeakageLens\sample_projects\preprocessing_leakage.py`
- **Line Number:** 19
- **Issue description:** Detected 'RandomForestClassifier' call at line 19 missing a 'random_state' or 'seed' argument. This will lead to non-reproducible dataset splits or model initializations.

**Code Context:**
```python
# line 19
model = RandomForestClassifier()
```

#### AI Recommendation Details
- **Explanation:** Random state or seed is not configured for a randomized operation (such as train-test split or model training).
- **Risk:** Non-reproducible pipeline. Every run will produce slightly different data splits, model initializations, and evaluation scores, making debugging difficult.
- **Suggested Fix:** Pass a fixed integer (e.g. 42) to the random_state or seed parameter.

**Corrected Code snippet:**
```python
# Add random_state to split or model
X_train, X_test = train_test_split(X, random_state=42)
model = RandomForestClassifier(random_state=42)
```
- **Best Practice:** Set fixed seeds for all stochastic elements to ensure reproducibility across machines and runs.

---

### 8. Missing Global Seed [MAJOR]
- **File:** `C:\Users\admin\OneDrive\Desktop\code\LeakageLens\sample_projects\preprocessing_leakage.py`
- **Line Number:** 1
- **Issue description:** No global random seed initialization was detected in this file. Without global seeds for numpy, random, or deep learning frameworks, operations might not be fully reproducible.

**Code Context:**
```python
# line 1
import numpy as np
```

#### AI Recommendation Details
- **Explanation:** No global seed initialization was detected for numpy, random, or deep learning libraries.
- **Risk:** Implicit randomness in libraries can lead to non-deterministic execution in random number generators.
- **Suggested Fix:** Initialize global seeds at the entry point of your script or notebook.

**Corrected Code snippet:**
```python
import random
import numpy as np
random.seed(42)
np.random.seed(42)
```
- **Best Practice:** Establish a global seed setup block at the top of your scripts to ground all downstream random generators.

---

### 9. Testing on Training Data [MAJOR]
- **File:** `C:\Users\admin\OneDrive\Desktop\code\LeakageLens\sample_projects\preprocessing_leakage.py`
- **Line Number:** 20
- **Issue description:** Model fit on 'X_train' at line 20 is evaluated on training features without any test or validation dataset evaluations detected. This results in optimistic bias.

**Code Context:**
```python
# line 20
model.fit(X_train, y_train)
```

#### AI Recommendation Details
- **Explanation:** Evaluation or scoring is executed on the training data.
- **Risk:** Optimistic score reporting. High accuracy on train data only indicates memorization/overfitting, not actual generalizability.
- **Suggested Fix:** Perform model prediction and metric evaluation on a separate, held-out test/validation set.

**Corrected Code snippet:**
```python
# Evaluate on test set
predictions = model.predict(X_test)
score = model.score(X_test, y_test)
```
- **Best Practice:** Keep train evaluations strictly as diagnostic indicators and rely on test evaluations for final model validation.

---

### 10. Unused Import [MINOR]
- **File:** `C:\Users\admin\OneDrive\Desktop\code\LeakageLens\sample_projects\preprocessing_leakage.py`
- **Line Number:** 1
- **Issue description:** Import 'np' is declared at line 1 but never used in the file.

**Code Context:**
```python
# line 1
import numpy as np
```

#### AI Recommendation Details
- **Explanation:** Detected Unused Import issue in file C:\Users\admin\OneDrive\Desktop\code\LeakageLens\sample_projects\preprocessing_leakage.py.
- **Risk:** Affects codebase quality and reliability: Import 'np' is declared at line 1 but never used in the file.
- **Suggested Fix:** Remove 'import np' or the corresponding import statement.

**Corrected Code snippet:**
```python
Remove 'import np' or the corresponding import statement.
```
- **Best Practice:** Follow standard machine learning development guidelines for pipeline reproducibility.

---
