import os
import pickle
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from leakagelens.core.normalization import normalize_file
from leakagelens.ml.feature_extractor import extract_ast_features

BENCHMARK_SAMPLES = [
    # LEAKY SAMPLES (Label 1)
    ("scaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\nX_train, X_test = train_test_split(X_scaled)", 1),
    ("X_train, X_test, y_train, y_test = train_test_split(X, y)\nclf = RandomForestClassifier()\nclf.fit(X_train, y_train)", 1),
    ("df['timestamp'] = pd.to_datetime(df['date'])\nX_train, X_test = train_test_split(df)", 1),
    ("X = df[['feature1', 'churn']]\nclf.fit(X, y)", 1),
    ("clf = RandomForestClassifier()\nmse = mean_squared_error(y_test, clf.predict(X_test))", 1),
    ("train_acc = model.score(X_train, y_train)", 1),
    ("df = pd.read_csv('/Users/admin/dataset.csv')", 1),
    ("fit_transform(X)\ntrain_test_split(X)", 1),
    ("X_train, X_test = train_test_split(X)\nclf = GradientBoostingClassifier()", 1),
    ("clf.fit(X_test, y_test)", 1),

    # CLEAN SAMPLES (Label 0)
    ("X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)\nscaler = StandardScaler()\nX_train_scaled = scaler.fit_transform(X_train)\nX_test_scaled = scaler.transform(X_test)", 0),
    ("np.random.seed(42)\nclf = RandomForestClassifier(random_state=42)\nclf.fit(X_train, y_train)\nacc = accuracy_score(y_test, clf.predict(X_test))", 0),
    ("split_idx = int(len(df) * 0.8)\ntrain_df = df.iloc[:split_idx]\ntest_df = df.iloc[split_idx:]", 0),
    ("X = df.drop(columns=['target'])\ny = df['target']\nX_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)", 0),
    ("model = RandomForestRegressor(random_state=42)\nmodel.fit(X_train, y_train)\nmse = mean_squared_error(y_test, model.predict(X_test))", 0),
    ("DATA_DIR = Path(__file__).parent / 'data'\ndf = pd.read_csv(DATA_DIR / 'dataset.csv')", 0),
    ("X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)\nmodel.fit(X_train, y_train)\ntest_score = model.score(X_test, y_test)", 0),
]


def train_and_save_model(model_save_path: Path):
    """Train RandomForest + TF-IDF model on benchmark snippets and save to pkl."""
    corpus = [sample[0] for sample in BENCHMARK_SAMPLES]
    labels = np.array([sample[1] for sample in BENCHMARK_SAMPLES])

    # 1. TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(max_features=25, ngram_range=(1, 2))
    tfidf_feats = vectorizer.fit_transform(corpus).toarray()

    # 2. Extract AST features for each sample via temporary file
    ast_feats_list = []
    tmp_path = model_save_path.parent / "_temp_train.py"
    try:
        for text, _ in BENCHMARK_SAMPLES:
            tmp_path.write_text(text, encoding="utf-8")
            norm_file = normalize_file(tmp_path)
            ast_feats_list.append(extract_ast_features(norm_file))
    finally:
        if tmp_path.exists():
            tmp_path.unlink()

    ast_feats = np.array(ast_feats_list)

    # 3. Combine TF-IDF and AST features
    X_combined = np.hstack([tfidf_feats, ast_feats])

    # 4. Train RandomForest Classifier
    model = RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42)
    model.fit(X_combined, labels)

    # 5. Save model bundle
    bundle = {
        "vectorizer": vectorizer,
        "model": model,
        "ast_feature_names": [
            "fit_transform_before_split",
            "stochastic_no_seed_count",
            "stochastic_total_count",
            "target_in_features",
            "temporal_leak_risk",
            "metric_mismatch",
            "ast_node_density",
            "missing_split_call",
        ]
    }

    model_save_path.parent.mkdir(parents=True, exist_ok=True)
    with open(model_save_path, "wb") as f:
        pickle.dump(bundle, f)

    return bundle


if __name__ == "__main__":
    target = Path(__file__).parent / "trained_model.pkl"
    train_and_save_model(target)
    print(f"ML Leakage Model trained & saved to {target}")
