import ast
from typing import List, Dict, Any
from leakagelens.core.normalization import NormalizedFile


def extract_ast_features(file: NormalizedFile) -> List[float]:
    """Extract 8 numerical AST structural features from a normalized Python file."""
    if not file.ast_node:
        return [0.0] * 8

    # 1. Fit transform before split
    split_lines = [
        n.lineno for n in ast.walk(file.ast_node)
        if isinstance(n, ast.Call) and isinstance(n.func, (ast.Name, ast.Attribute)) and
        (getattr(n.func, "id", None) == "train_test_split" or getattr(n.func, "attr", None) == "train_test_split")
    ]
    first_split = min(split_lines) if split_lines else float("inf")
    
    fit_transform_before_split = 0.0
    stochastic_no_seed = 0.0
    stochastic_total = 0.0
    target_in_features = 0.0
    has_temporal = 0.0
    has_clf = 0.0
    has_reg_metric = 0.0
    ast_count = 0.0

    stochastic_names = {"train_test_split", "RandomForestClassifier", "RandomForestRegressor", "GradientBoostingClassifier", "KMeans"}
    temporal_kws = {"date", "timestamp", "datetime", "time"}
    target_cols = {"target", "label", "churn", "price", "outcome"}

    for node in ast.walk(file.ast_node):
        ast_count += 1.0
        
        # Check fit_transform before split
        if isinstance(node, ast.Call):
            func_attr = getattr(node.func, "attr", "") or getattr(node.func, "id", "")
            if func_attr == "fit_transform" and getattr(node, "lineno", 0) < first_split:
                fit_transform_before_split = 1.0

            if func_attr in stochastic_names:
                stochastic_total += 1.0
                has_rs = any(kw.arg == "random_state" for kw in node.keywords)
                if not has_rs:
                    stochastic_no_seed += 1.0

            if func_attr == "RandomForestClassifier":
                has_clf = 1.0
            if func_attr in {"mean_squared_error", "r2_score"}:
                has_reg_metric = 1.0

        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            if any(kw in node.value.lower() for kw in temporal_kws):
                has_temporal = 1.0
            if node.value.lower() in target_cols:
                target_in_features = 1.0

    temporal_leak_risk = 1.0 if (has_temporal == 1.0 and first_split != float("inf")) else 0.0
    metric_mismatch = 1.0 if (has_clf == 1.0 and has_reg_metric == 1.0) else 0.0

    return [
        fit_transform_before_split,
        stochastic_no_seed,
        stochastic_total,
        target_in_features,
        temporal_leak_risk,
        metric_mismatch,
        ast_count / 100.0,
        1.0 if first_split == float("inf") else 0.0,
    ]
