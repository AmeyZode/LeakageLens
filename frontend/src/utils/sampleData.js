// Comprehensive Data Models, Sample Projects, Benchmark References & Academic Literature for LeakageLens

export const SAMPLE_FILES = {
  'preprocessing_leakage.py': `import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

df = pd.read_csv("dataset.csv")
X = df.drop(columns=["target"])
y = df["target"]

scaler = StandardScaler()
# CRITICAL BUG [L001]: Fitting scaler on full dataset before train_test_split
# Information from test distribution leaks into X_scaled statistics
X_scaled = scaler.fit_transform(X)

# Missing random_state for reproducibility [R001]
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y)

# Missing random_state in stochastic model initialization [R001]
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Evaluating on train data instead of unseen test data [E001]
train_acc = model.score(X_train, y_train)
print(f"Train Accuracy: {train_acc}")
`,

  'leaky_pipeline_benchmark.py': `import pandas as pd
import numpy as np
import math
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import mean_squared_error

def run_churn_pipeline():
    df = pd.read_csv("customer_churn.csv")
    
    # Feature Engineering & Target prep
    X = df.drop(columns=["churn_label"])
    y = df["churn_label"]

    # Preprocessing before split - Global Imputation Leakage [L002]
    X_filled = X.fillna(X.mean())

    # Split without seed [R001]
    X_train, X_test, y_train, y_test = train_test_split(X_filled, y, test_size=0.2)

    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)

    # Evaluating classification model with regression metric (MSE) [E003]
    preds = model.predict(X_test)
    mse_score = mean_squared_error(y_test, preds)
    print(f"Pipeline Mean Squared Error: {mse_score}")

if __name__ == "__main__":
    run_churn_pipeline()
`,

  'temporal_lookahead_leakage.py': `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import Ridge

# Financial / Time Series Stock Prediction Pipeline
df = pd.read_csv("stock_prices.csv")
df['Date'] = pd.to_datetime(df['Date'])
df = df.sort_values('Date')

# Feature Engineering: 7-day rolling future return (CRITICAL LOOKAHEAD LEAKAGE [L005])
df['future_return_proxy'] = df['Close'].shift(-7)
df['rolling_mean_full'] = df['Close'].transform(lambda x: x.expanding().mean())

X = df[['Open', 'High', 'Low', 'Volume', 'future_return_proxy']]
y = df['Close']

# Improper random shuffle on time-series dataset [L005]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=True)

model = Ridge()
model.fit(X_train, y_train)
print(f"Test Score: {model.score(X_test, y_test)}")
`,

  'cross_validation_leakage.py': `import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import KFold
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

df = pd.read_csv("clinical_trials.csv")
X = df.drop(columns=["patient_outcome"])
y = df["patient_outcome"]

# CRITICAL FLAW: Global transformation performed prior to KFold split [L001 / L003]
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

kf = KFold(n_splits=5, shuffle=True)
scores = []

for train_idx, val_idx in kf.split(X_scaled):
    X_tr, X_val = X_scaled[train_idx], X_scaled[val_idx]
    y_tr, y_val = y.iloc[train_idx], y.iloc[val_idx]
    
    model = LogisticRegression()
    model.fit(X_tr, y_tr)
    scores.append(accuracy_score(y_val, model.predict(X_val)))

print("Mean CV Accuracy:", sum(scores)/len(scores))
`,

  'leaky_notebook.ipynb': `{
 "cells": [
  {
   "cell_type": "code",
   "execution_count": 1,
   "metadata": {},
   "source": [
    "import pandas as pd\\n",
    "from sklearn.preprocessing import MinMaxScaler\\n",
    "from sklearn.model_selection import train_test_split\\n",
    "from sklearn.svm import SVC\\n",
    "\\n",
    "df = pd.read_csv('medical_data.csv')\\n",
    "# Preprocessing full dataset before splitting cell\\n",
    "scaler = MinMaxScaler()\\n",
    "df_scaled = scaler.fit_transform(df.drop(columns=['diagnosis']))"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 2,
   "metadata": {},
   "source": [
    "# Cell executed out-of-order or sharing unpartitioned state\\n",
    "X_train, X_test, y_train, y_test = train_test_split(df_scaled, df['diagnosis'])\\n",
    "model = SVC()\\n",
    "model.fit(X_train, y_train)\\n",
    "print('Notebook Model Accuracy:', model.score(X_train, y_train))"
   ]
  }
 ],
 "metadata": {
  "language_info": { "name": "python" }
 },
 "nbformat": 4,
 "nbformat_minor": 2
}`
};

export const DEFAULT_SCAN_RESULT = {
  score: 45,
  counts: {
    critical: 2,
    major: 4,
    minor: 3
  },
  files_scanned: 3,
  ml_insights: {
    ml_risk_score: 46.7,
    confidence_label: "SUSPICIOUS_PIPELINE",
    overoptimism_delta: 24.8,
    estimated_production_accuracy: 62.4,
    apparent_training_accuracy: 87.2,
    feature_importances: [
      { feature: "Preprocessing Before Split Ratio", importance: 38.5 },
      { feature: "Missing Random State Seeds", importance: 24.2 },
      { feature: "Target Variable Overlap", importance: 19.8 },
      { feature: "Evaluation Metric Mismatch", importance: 17.5 }
    ]
  },
  ast_metrics: {
    total_ast_nodes: 418,
    function_definitions: 7,
    variable_assignments: 32,
    pipeline_transformations: 12,
    cyclomatic_complexity: 14
  },
  rule_errors: [],
  issues: [
    {
      rule_id: "L001",
      rule_name: "Preprocessing Leakage",
      severity: "critical",
      category: "Data Separation & Preprocessing",
      file_path: "preprocessing_leakage.py",
      line_number: 16,
      context_line: "X_scaled = scaler.fit_transform(X)",
      description: "StandardScaler.fit_transform() executed on the entire feature matrix prior to train_test_split. The test set distribution (mean and variance) leaks into the training data space.",
      impact: "Inflates cross-validation and training performance by 15-30% while causing unexpected performance degradation when deployed on unseen distribution shifts.",
      suggested_fix: "# Correct Protocol: Split dataset first, fit scaler exclusively on training partition\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nscaler = StandardScaler()\nX_train_scaled = scaler.fit_transform(X_train)\nX_test_scaled = scaler.transform(X_test)",
      ai_recommendation: {
        explanation: "Fitting transformations on the full dataset causes statistical parameters (e.g. mean, std, quantiles) of the hold-out test set to contaminate training representations.",
        fix: "# Perform train/test split first\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nscaler = StandardScaler()\nX_train = scaler.fit_transform(X_train)\nX_test = scaler.transform(X_test)"
      }
    },
    {
      rule_id: "L004",
      rule_name: "Target Leakage",
      severity: "critical",
      category: "Feature Engineering & Targets",
      file_path: "preprocessing_leakage.py",
      line_number: 11,
      context_line: "X = df.drop(columns=[\"target\"])",
      description: "Target column or proxy variable remains partially accessible in predictor matrices.",
      impact: "Model learns direct shortcut correlations that do not exist in real-world inference environments.",
      suggested_fix: "X = df.drop(columns=['target'])\ny = df['target']",
      ai_recommendation: {
        explanation: "Ensure the target column is strictly isolated from predictors.",
        fix: "X = df.drop(columns=['target'])\ny = df['target']"
      }
    },
    {
      rule_id: "R001",
      rule_name: "Missing Random State",
      severity: "major",
      category: "Reproducibility & Determinism",
      file_path: "preprocessing_leakage.py",
      line_number: 19,
      context_line: "X_train, X_test, y_train, y_test = train_test_split(X_scaled, y)",
      description: "train_test_split called without random_state parameter, making data partitioning stochastic and non-reproducible across runs.",
      impact: "Prevents verification of experimental results and causes non-deterministic audit discrepancies.",
      suggested_fix: "X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, random_state=42)",
      ai_recommendation: {
        explanation: "Stochastic data splitting lacks explicit random state seed.",
        fix: "X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)"
      }
    },
    {
      rule_id: "R001",
      rule_name: "Missing Random State",
      severity: "major",
      category: "Reproducibility & Determinism",
      file_path: "preprocessing_leakage.py",
      line_number: 22,
      context_line: "model = RandomForestClassifier()",
      description: "RandomForestClassifier initialized without explicit random_state seed.",
      impact: "Model tree bootstrap sampling varies on each execution.",
      suggested_fix: "model = RandomForestClassifier(random_state=42)",
      ai_recommendation: {
        explanation: "Ensemble model training without seed constant.",
        fix: "model = RandomForestClassifier(random_state=42)"
      }
    },
    {
      rule_id: "E001",
      rule_name: "Evaluation on Train Data",
      severity: "major",
      category: "Model Validation & Metrics",
      file_path: "preprocessing_leakage.py",
      line_number: 26,
      context_line: "train_acc = model.score(X_train, y_train)",
      description: "Model performance measured directly on training set rather than validation or hold-out test set.",
      impact: "Masks severe overfitting; reported metrics do not reflect true out-of-sample generalization capacity.",
      suggested_fix: "test_acc = model.score(X_test, y_test)\nprint(f'Test Accuracy: {test_acc}')",
      ai_recommendation: {
        explanation: "Reporting training score hides model overfitting and overestimates generalization accuracy.",
        fix: "test_acc = model.score(X_test, y_test)"
      }
    },
    {
      rule_id: "E003",
      rule_name: "Metric Misuse",
      severity: "major",
      category: "Model Validation & Metrics",
      file_path: "leaky_pipeline_benchmark.py",
      line_number: 55,
      context_line: "mse_score = mean_squared_error(y_test, preds)",
      description: "Regression metric 'mean_squared_error' is evaluated on classification model predictions.",
      impact: "Distorts statistical validation and fails standard diagnostic threshold checks.",
      suggested_fix: "from sklearn.metrics import accuracy_score, f1_score\nacc = accuracy_score(y_test, preds)",
      ai_recommendation: {
        explanation: "Evaluating classification model outputs using regression MSE metric.",
        fix: "from sklearn.metrics import accuracy_score\nprint(f'Accuracy: {accuracy_score(y_test, preds)}')"
      }
    },
    {
      rule_id: "Q001",
      rule_name: "Unused Imports",
      severity: "minor",
      category: "Code Quality & Hygiene",
      file_path: "leaky_pipeline_benchmark.py",
      line_number: 3,
      context_line: "import math",
      description: "Imported library 'math' is unused across program AST nodes.",
      impact: "Unnecessary namespace pollution and memory overhead.",
      suggested_fix: "# Remove unused import math",
      ai_recommendation: {
        explanation: "Remove unused library imports.",
        fix: "# Remove 'import math'"
      }
    }
  ]
};

export const SIMULATION_SCENARIOS = [
  {
    id: "pre_split_leakage",
    title: "1. Preprocessing Before Split Leakage",
    category: "Data Separation",
    severity: "Critical",
    description: "Fitting a standardizer / normalizer (e.g. StandardScaler, MinMaxScaler) or PCA on the entire dataset prior to splitting into train/test sets.",
    codeSnippetBad: `# Bad Practice: Full dataset fit
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X) # Leaks test μ & σ
X_tr, X_te, y_tr, y_te = train_test_split(X_scaled, y)`,
    codeSnippetGood: `# Correct Protocol: Split first, fit on train only
X_tr, X_te, y_tr, y_te = train_test_split(X, y)
scaler = StandardScaler()
X_tr = scaler.fit_transform(X_tr)
X_te = scaler.transform(X_te) # Transform only!`,
    mathExplanation: "Let dataset D = D_train ∪ D_test. Calculating sample mean μ_D = (1/N) ∑ x_i introduces dependency between x_test and the standardized x_train' = (x_train - μ_D)/σ_D.",
    estimatedOveroptimism: "+18.4% Accuracy Inflation",
    riskLevel: "CRITICAL"
  },
  {
    id: "target_leakage",
    title: "2. Target / Feature Outcome Leakage",
    category: "Feature Engineering",
    severity: "Critical",
    description: "Features containing direct proxies or future outcome variables (e.g. hospital discharge date used to predict ICU admission).",
    codeSnippetBad: `# Bad Practice: Outcome proxy in feature matrix
X = df[['age', 'blood_pressure', 'discharge_status', 'days_in_hospital']]
y = df['mortality_outcome'] # discharge_status directly leaks y!`,
    codeSnippetGood: `# Correct Protocol: Exclude future outcome variables
X = df[['age', 'blood_pressure', 'admission_vitals']]
y = df['mortality_outcome']`,
    mathExplanation: "Mutual Information I(X_i; Y) ≈ H(Y), causing the model to neglect all generalizable biological signals in favor of the proxy artifact.",
    estimatedOveroptimism: "+35.2% Accuracy Inflation",
    riskLevel: "CRITICAL"
  },
  {
    id: "temporal_lookahead",
    title: "3. Temporal Lookahead Bias",
    category: "Time Series Forecasting",
    severity: "Critical",
    description: "Applying random shuffling or future expanding windows on time-dependent sequential or financial data.",
    codeSnippetBad: `# Bad Practice: Random shuffle on time series
X_tr, X_te, y_tr, y_te = train_test_split(X, y, shuffle=True) # Destroys causality`,
    codeSnippetGood: `# Correct Protocol: Temporal chronological boundary
# e.g. TimeSeriesSplit or split by date
split_date = '2024-01-01'
train = df[df['Date'] < split_date]
test = df[df['Date'] >= split_date]`,
    mathExplanation: "Violates non-anticipative condition: P(y_t | x_{t+k}) for k > 0 is learned during training, which is inaccessible at actual real-time inference.",
    estimatedOveroptimism: "+42.1% Accuracy Inflation",
    riskLevel: "CRITICAL"
  },
  {
    id: "cross_validation_leakage",
    title: "4. Cross-Validation Loop Leakage",
    category: "Validation Protocols",
    severity: "Major",
    description: "Performing feature selection, imputation, or scaling outside the K-Fold cross validation loop rather than inside each fold.",
    codeSnippetBad: `# Bad Practice: Feature selection before CV loop
selector = SelectKBest(k=10).fit(X, y) # Leaks labels of all folds!
X_selected = selector.transform(X)
cv_scores = cross_val_score(model, X_selected, y, cv=5)`,
    codeSnippetGood: `# Correct Protocol: scikit-learn Pipeline inside CV
from sklearn.pipeline import make_pipeline
pipe = make_pipeline(SelectKBest(k=10), model)
cv_scores = cross_val_score(pipe, X, y, cv=5)`,
    mathExplanation: "Feature selection on the full dataset selects features that correlate with test folds by chance, causing severe selection bias.",
    estimatedOveroptimism: "+14.6% Accuracy Inflation",
    riskLevel: "MAJOR"
  },
  {
    id: "evaluation_on_train",
    title: "5. Training Set Evaluation Bias",
    category: "Evaluation Integrity",
    severity: "Major",
    description: "Evaluating model accuracy, ROC-AUC, or F1 scores on the data used for model parameter optimization.",
    codeSnippetBad: `# Bad Practice: Evaluating on training data
model.fit(X_train, y_train)
acc = model.score(X_train, y_train) # Masking overfitting`,
    codeSnippetGood: `# Correct Protocol: Evaluate on unseen hold-out set
model.fit(X_train, y_train)
test_acc = model.score(X_test, y_test)`,
    mathExplanation: "Empirical risk minimization ensures R_emp(f) < R_true(f). Training score measures memorization capacity rather than generalization.",
    estimatedOveroptimism: "+22.0% Accuracy Inflation",
    riskLevel: "MAJOR"
  },
  {
    id: "metric_misuse",
    title: "6. Metric & Objective Misalignment",
    category: "Evaluation Integrity",
    severity: "Major",
    description: "Using regression metrics (e.g. Mean Squared Error) on discrete classification models or accuracy on highly imbalanced classes.",
    codeSnippetBad: `# Bad Practice: MSE on binary classification labels
mse = mean_squared_error(y_test, classifier.predict(X_test))`,
    codeSnippetGood: `# Correct Protocol: Proper classification metrics
from sklearn.metrics import roc_auc_score, f1_score
auc = roc_auc_score(y_test, classifier.predict_proba(X_test)[:, 1])`,
    mathExplanation: "MSE treats categorical distances linearly and penalizes correct high-confidence predictions inappropriately.",
    estimatedOveroptimism: "Distorted Validation Diagnostics",
    riskLevel: "MAJOR"
  }
];

export const COMPLIANCE_FRAMEWORKS = [
  {
    id: "eu_ai_act",
    name: "EU Artificial Intelligence Act",
    clause: "Article 10 (Data and Data Governance)",
    requirement: "Training, validation and testing data sets shall be subject to appropriate data governance and management practices to prevent unintended bias and statistical data leakage.",
    status: "compliant_with_fixes",
    riskCategory: "High-Risk AI Systems",
    leakageRulesMapped: ["L001", "L002", "L003", "L004", "L005"]
  },
  {
    id: "nist_ai_rmf",
    name: "NIST AI Risk Management Framework",
    clause: "MEASURE 2.5 & 2.6 (Model Validity & Generalization)",
    requirement: "AI system performance must be verified against independent out-of-distribution evaluation data, ensuring training partitioning integrity and absence of lookahead artifacts.",
    status: "non_compliant",
    riskCategory: "Model Trust & Integrity",
    leakageRulesMapped: ["L001", "L005", "E001", "E002"]
  },
  {
    id: "ieee_2801",
    name: "IEEE Standard 2801-2022",
    clause: "Section 6.4 (Machine Learning Reproducibility)",
    requirement: "Random seeds, stochastic partition bounds, and data processing sequences must be explicitly logged and deterministically reproducible.",
    status: "non_compliant",
    riskCategory: "Experimental Reproducibility",
    leakageRulesMapped: ["R001", "R002"]
  },
  {
    id: "iso_42001",
    name: "ISO/IEC 42001:2023",
    clause: "Annex A.7 (Data Quality for AI Systems)",
    requirement: "Verification that feature extraction methods do not encode downstream outcome data prior to model inference training.",
    status: "compliant_with_fixes",
    riskCategory: "Data Quality Management",
    leakageRulesMapped: ["L003", "L004", "E003"]
  }
];

export const ACADEMIC_REFERENCES = [
  {
    id: 1,
    key: "AlOmar2023",
    authors: "E. A. AlOmar, C. DeMario, R. Shagawat, and B. Kreiser",
    title: "LeakageDetector: An Open Source Data Leakage Analysis Tool in Machine Learning Pipelines",
    venue: "Proceedings of the International Conference on Software Engineering for AI Systems (SE4AI)",
    year: 2023,
    type: "Conference",
    focus: "Rule-based static analysis for Python ML scripts"
  },
  {
    id: 2,
    key: "Truong2024",
    authors: "O. Truong, T. Zhang, A. Marchareddy, R. Lee, J. Busold, M. Socas, and E. A. AlOmar",
    title: "LeakageDetector 2.0: Analyzing Data Leakage in Jupyter-Driven Machine Learning Pipelines",
    venue: "Software Engineering in Practice (SEIP)",
    year: 2024,
    type: "Conference",
    focus: "Cell dependency tracking and VS Code extension for Jupyter Notebooks"
  },
  {
    id: 3,
    key: "Sasse2025",
    authors: "L. Sasse, E. Nicolaisen-Sobesky, J. Dukart, S. B. Eickhoff, M. Götz, S. Hamdan, et al.",
    title: "Overview of Leakage Scenarios in Supervised Machine Learning",
    venue: "Journal of Big Data, vol. 12",
    year: 2025,
    type: "Journal",
    focus: "Comprehensive theoretical taxonomy of feature, temporal, and cross-validation leakage"
  },
  {
    id: 4,
    key: "Grafberger2022",
    authors: "S. Grafberger, P. Groth, J. Stoyanovich, and S. Schelter",
    title: "Data Distribution Debugging in Machine Learning Pipelines",
    venue: "The VLDB Journal, vol. 31",
    year: 2022,
    type: "Journal",
    focus: "mlinspect DAG runtime dataflow graph inspection"
  },
  {
    id: 5,
    key: "Apicella2025",
    authors: "A. Apicella, F. Isgrò, and R. Prevete",
    title: "Don't Push the Button! Exploring Data Leakage Risks in Machine Learning and Transfer Learning",
    venue: "Artificial Intelligence Review, vol. 58",
    year: 2025,
    type: "Journal",
    focus: "Theoretical foundation of transfer learning & representation leakage"
  },
  {
    id: 6,
    key: "Rosenblatt2024",
    authors: "M. Rosenblatt, L. Tejavibulya, R. Jiang, S. Noble, and D. Scheinost",
    title: "Data Leakage Inflates Prediction Performance in Connectome-Based Machine Learning Models",
    venue: "Nature Communications, vol. 15",
    year: 2024,
    type: "Journal",
    focus: "Empirical verification of statistical inflation caused by improper feature selection"
  },
  {
    id: 7,
    key: "Lee2023",
    authors: "H. T. Lee, H. R. Cheon, S. H. Lee, M. Shim, and H. J. Hwang",
    title: "Risk of Data Leakage in Estimating the Diagnostic Performance of Deep Learning-Based Systems",
    venue: "Scientific Reports, vol. 13",
    year: 2023,
    type: "Journal",
    focus: "Cross-validation errors in medical AI diagnostic systems"
  },
  {
    id: 8,
    key: "HernandezLopez2024",
    authors: "J. A. Hernández-López, B. Chen, M. Saad, T. Sharma, and D. Varró",
    title: "On Inter-Dataset Code Duplication and Data Leakage in Large Language Models",
    venue: "arXiv preprint arXiv:2401.07930",
    year: 2024,
    type: "Preprint",
    focus: "Inter-dataset overlap & contamination in foundation models"
  },
  {
    id: 9,
    key: "Babu2024",
    authors: "M. A. A. Babu, S. K. Pandey, D. Durisic, A. C. Koppisetty, and M. Staron",
    title: "Improving Image Data Leakage Detection in Automotive Software",
    venue: "arXiv preprint arXiv:2410.23312",
    year: 2024,
    type: "Preprint",
    focus: "Computer vision and automotive image domain leakage"
  },
  {
    id: 10,
    key: "Bazangani2024",
    authors: "O. Bazangani, P. Amiri Eliasi, S. Picek, and L. Batina",
    title: "Can Machine Learn Pipeline Leakage?",
    venue: "Design, Automation and Test in Europe Conference (DATE)",
    year: 2024,
    type: "Conference",
    focus: "Meta-learning approaches to pipeline leakage pattern recognition"
  },
  {
    id: 11,
    key: "Fund2025",
    authors: "F. Fund, M. Saeed, S. Malik, and K. Ishak",
    title: "Learning from Irreproducibility: Introducing Data Leakage Case Studies for Machine Learning Education",
    venue: "ACM Conference on Reproducibility and Replicability (ACM REP '25)",
    year: 2025,
    type: "Conference",
    focus: "Pedagogical analysis and student mistakes in ML workflows"
  }
];

export const LITERATURE_COMPARISON = [
  {
    tool: "LeakageLens (Proposed)",
    technique: "Static AST Dataflow Analysis + AI Audit",
    pySupport: "Yes (.py scripts & .ipynb notebooks)",
    autoFix: "Yes (Rule-based + LLM Quick Fixes)",
    overhead: "Zero Execution Overhead (Pure AST)",
    multiFile: "Full Multi-File & Project Scope",
    governance: "EU AI Act & NIST RMF Mappings"
  },
  {
    tool: "LeakageDetector (AlOmar et al.)",
    technique: "Rule-based Static Code Inspection",
    pySupport: "Python scripts only",
    autoFix: "Basic Rule Suggestions",
    overhead: "Zero Execution Overhead",
    multiFile: "Limited Single-Script Scope",
    governance: "None"
  },
  {
    tool: "LeakageDetector 2.0 (Truong et al.)",
    technique: "Jupyter Cell Dependency Graphs",
    pySupport: "Notebooks only (.ipynb)",
    autoFix: "VS Code Real-time Corrections",
    overhead: "Low Overhead",
    multiFile: "No Multi-File Support",
    governance: "None"
  },
  {
    tool: "mlinspect (Grafberger et al.)",
    technique: "Dataflow DAG Instrumentation",
    pySupport: "Python scripts",
    autoFix: "No Automated Fixes",
    overhead: "High Runtime Overhead (10-30x)",
    multiFile: "Partial Support",
    governance: "None"
  },
  {
    tool: "Sasse et al.",
    technique: "Theoretical Taxonomy & Classification",
    pySupport: "Conceptual Analysis Only",
    autoFix: "None (Theoretical)",
    overhead: "N/A",
    multiFile: "N/A",
    governance: "Taxonomy Only"
  }
];
