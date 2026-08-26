import os
import pickle
import numpy as np
from pathlib import Path
from typing import Dict, Any, List
from leakagelens.core.normalization import NormalizedFile
from leakagelens.ml.feature_extractor import extract_ast_features


MODEL_FILE_PATH = Path(__file__).parent / "trained_model.pkl"


class MLLeakageDetector:
    """Trained Machine Learning Model (RandomForest + TF-IDF) to detect code leakage risks."""

    def __init__(self):
        self.bundle = self._load_or_train_model()
        self.model = self.bundle["model"]
        self.vectorizer = self.bundle["vectorizer"]
        self.ast_feature_names = self.bundle["ast_feature_names"]

    def _load_or_train_model(self) -> Dict[str, Any]:
        """Load trained model weights from pkl or train on startup."""
        if not MODEL_FILE_PATH.exists():
            from leakagelens.ml.model_trainer import train_and_save_model
            return train_and_save_model(MODEL_FILE_PATH)

        try:
            with open(MODEL_FILE_PATH, "rb") as f:
                return pickle.load(f)
        except Exception:
            from leakagelens.ml.model_trainer import train_and_save_model
            return train_and_save_model(MODEL_FILE_PATH)

    def predict_leakage_risk(self, file: NormalizedFile) -> Dict[str, Any]:
        """Predict data leakage risk score (0-100%) and feature breakdown for a file."""
        if not file.raw_source:
            return {
                "ml_risk_score": 0.0,
                "confidence_label": "CLEAN_PIPELINE",
                "feature_importances": [],
            }

        # 1. Extract TF-IDF code features
        tfidf_vec = self.vectorizer.transform([file.raw_source]).toarray()

        # 2. Extract AST structural features
        ast_vec = np.array([extract_ast_features(file)])

        # 3. Combine feature matrix
        X_sample = np.hstack([tfidf_vec, ast_vec])

        # 4. Model Inference
        probs = self.model.predict_proba(X_sample)[0]
        # prob of class 1 (leaky)
        leaky_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
        ml_risk_score = round(leaky_prob * 100.0, 1)

        # Determine confidence label
        if ml_risk_score >= 70.0:
            confidence_label = "CRITICAL_LEAKAGE_RISK"
        elif ml_risk_score >= 35.0:
            confidence_label = "SUSPICIOUS_PIPELINE"
        else:
            confidence_label = "CLEAN_PIPELINE"

        # Extract top feature importances
        all_feature_names = list(self.vectorizer.get_feature_names_out()) + self.ast_feature_names
        importances = self.model.feature_importances_

        top_indices = np.argsort(importances)[::-1][:4]
        feature_breakdown = []
        for idx in top_indices:
            feat_name = all_feature_names[idx] if idx < len(all_feature_names) else f"feature_{idx}"
            score = round(float(importances[idx]) * 100.0, 1)
            if score > 0.0:
                feature_breakdown.append({
                    "feature": feat_name.replace("_", " ").title(),
                    "importance": score
                })

        return {
            "ml_risk_score": ml_risk_score,
            "confidence_label": confidence_label,
            "feature_importances": feature_breakdown,
        }
