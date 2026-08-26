import ast
from typing import List
from leakagelens.rules.base_rule import BaseRule, Issue
from leakagelens.core.normalization import NormalizedFile
from leakagelens.core.context_builder import PipelineContext


def _func_name(node: ast.AST) -> str:
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        base = _func_name(node.value)
        return f"{base}.{node.attr}" if base else node.attr
    return ""


def _source_line(file: NormalizedFile, line_number: int) -> str:
    lines = file.raw_source.splitlines()
    if 1 <= line_number <= len(lines):
        return lines[line_number - 1].strip()
    return ""


def _mentions_train(node: ast.AST) -> bool:
    for child in ast.walk(node):
        if isinstance(child, ast.Name) and "train" in child.id.lower():
            return True
        if isinstance(child, ast.Attribute) and "train" in child.attr.lower():
            return True
    return False


class TestOnTrainRule(BaseRule):
    """Detects evaluations or predictions executed directly on training datasets."""
    rule_id = "E001"
    rule_name = "Evaluation on Train Data"
    severity = "major"
    description = "Evaluations or predictions executed directly on training datasets."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        if not file.ast_node:
            return []

        issues = []
        metric_functions = {"accuracy_score", "precision_score", "recall_score", "f1_score", "mean_squared_error", "r2_score"}
        for node in ast.walk(file.ast_node):
            if not isinstance(node, ast.Call):
                continue

            func_name = _func_name(node.func)
            short_name = func_name.split(".")[-1]
            if short_name not in {"score", "predict"} and short_name not in metric_functions:
                continue
            if not any(_mentions_train(arg) for arg in node.args):
                continue

            issues.append(Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=node.lineno,
                context_line=_source_line(file, node.lineno),
                description="Model performance is evaluated or predicted on training data, which can produce overoptimistic estimates.",
                suggested_fix="Evaluate final metrics on validation/test data that was not used for fitting."
            ))
        return issues


class MissingValidationRule(BaseRule):
    """Detects missing validation data splits (i.e. model trained on entire dataset)."""
    rule_id = "E002"
    rule_name = "Missing Validation Split"
    severity = "major"
    description = "Missing validation data splits."

    SPLIT_CALLS = {"train_test_split", "KFold", "StratifiedKFold", "TimeSeriesSplit", "cross_val_score"}

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        if not file.ast_node:
            return []

        # Check if file has any dataset splitting calls
        has_split = any(
            isinstance(node, ast.Call) and _func_name(node.func).split(".")[-1] in self.SPLIT_CALLS
            for node in ast.walk(file.ast_node)
        )
        if has_split:
            return []

        issues = []
        for node in ast.walk(file.ast_node):
            if not isinstance(node, ast.Call):
                continue
            short_name = _func_name(node.func).split(".")[-1]
            if short_name == "fit" and len(node.args) >= 2:
                first_arg = node.args[0]
                if isinstance(first_arg, ast.Name) and first_arg.id.upper() in {"X", "DF", "DATA", "DATASET"}:
                    issues.append(Issue(
                        rule_id=self.rule_id,
                        rule_name=self.rule_name,
                        severity=self.severity,
                        file_path=str(file.path),
                        line_number=node.lineno,
                        context_line=_source_line(file, node.lineno),
                        description=f"Model fit is called on full feature set '{first_arg.id}' without any train/test or cross-validation split detected in this file.",
                        suggested_fix="Split dataset into train and validation/test sets (e.g. via train_test_split) before model fitting."
                    ))
        return issues


class MetricMisuseRule(BaseRule):
    """Detects regression metrics used for classification, or vice versa."""
    rule_id = "E003"
    rule_name = "Metric Misuse"
    severity = "major"
    description = "Regression metrics used for classification, or vice versa."

    CLASSIFICATION_METRICS = {"accuracy_score", "precision_score", "recall_score", "f1_score", "roc_auc_score", "log_loss"}
    REGRESSION_METRICS = {"mean_squared_error", "mean_absolute_error", "r2_score", "root_mean_squared_error", "explained_variance_score"}

    CLASSIFICATION_MODELS = {"RandomForestClassifier", "LogisticRegression", "SVC", "GradientBoostingClassifier", "KNeighborsClassifier"}
    REGRESSION_MODELS = {"RandomForestRegressor", "LinearRegression", "Lasso", "Ridge", "GradientBoostingRegressor", "KNeighborsRegressor"}

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        if not file.ast_node:
            return []

        # Find models initialized in file
        has_clf_model = False
        has_reg_model = False
        for node in ast.walk(file.ast_node):
            if isinstance(node, ast.Call):
                name = _func_name(node.func).split(".")[-1]
                if name in self.CLASSIFICATION_MODELS:
                    has_clf_model = True
                elif name in self.REGRESSION_MODELS:
                    has_reg_model = True

        issues = []
        for node in ast.walk(file.ast_node):
            if not isinstance(node, ast.Call):
                continue
            metric_name = _func_name(node.func).split(".")[-1]

            if has_clf_model and metric_name in self.REGRESSION_METRICS:
                issues.append(Issue(
                    rule_id=self.rule_id,
                    rule_name=self.rule_name,
                    severity=self.severity,
                    file_path=str(file.path),
                    line_number=node.lineno,
                    context_line=_source_line(file, node.lineno),
                    description=f"Regression metric '{metric_name}' is called in a file containing classification models. Mismatched evaluation metrics distort model validation.",
                    suggested_fix=f"Use classification evaluation metrics (e.g. accuracy_score, f1_score, roc_auc_score) for classification models."
                ))
            elif has_reg_model and metric_name in self.CLASSIFICATION_METRICS:
                issues.append(Issue(
                    rule_id=self.rule_id,
                    rule_name=self.rule_name,
                    severity=self.severity,
                    file_path=str(file.path),
                    line_number=node.lineno,
                    context_line=_source_line(file, node.lineno),
                    description=f"Classification metric '{metric_name}' is called in a file containing regression models. Mismatched evaluation metrics distort model validation.",
                    suggested_fix=f"Use regression evaluation metrics (e.g. mean_squared_error, r2_score) for regression models."
                ))
        return issues
