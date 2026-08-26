import ast
import re
from typing import List, Optional
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


def _first_call_line(file: NormalizedFile, names: set[str]) -> Optional[int]:
    if not file.ast_node:
        return None

    lines = [
        node.lineno
        for node in ast.walk(file.ast_node)
        if isinstance(node, ast.Call) and _func_name(node.func).split(".")[-1] in names
    ]
    return min(lines) if lines else None


class PreprocessingLeakageRule(BaseRule):
    """Detects preprocessing fit/transform executed before data splits."""
    rule_id = "L001"
    rule_name = "Preprocessing Leakage"
    severity = "critical"
    description = "Preprocessing fit/transform executed before data splits."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        if not file.ast_node:
            return []

        split_line = _first_call_line(file, {"train_test_split"})
        if split_line is None:
            return []

        issues = []
        for node in ast.walk(file.ast_node):
            if not isinstance(node, ast.Call):
                continue

            func_name = _func_name(node.func)
            if func_name.split(".")[-1] != "fit_transform":
                continue
            if getattr(node, "lineno", split_line + 1) >= split_line:
                continue

            issues.append(Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=node.lineno,
                context_line=_source_line(file, node.lineno),
                description="A preprocessing fit_transform call runs before train_test_split. Fitting preprocessing on the full dataset can leak test-set distribution information into training.",
                suggested_fix="Split the dataset first, then call fit_transform on training data and transform on validation/test data."
            ))
        return issues


class OverlapLeakageRule(BaseRule):
    """Detects train/test datasets overlap or illegal combinations."""
    rule_id = "L002"
    rule_name = "Overlap Leakage"
    severity = "critical"
    description = "Train/test datasets overlap or illegal combinations."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        if not file.ast_node:
            return []

        issues = []
        for node in ast.walk(file.ast_node):
            if not isinstance(node, ast.Call):
                continue

            func_name = _func_name(node.func)
            short_name = func_name.split(".")[-1]

            # Case 1: Model fit called with test dataset variables (e.g. fit(X_test, y_test))
            if short_name == "fit" and len(node.args) >= 1:
                first_arg = node.args[0]
                if isinstance(first_arg, ast.Name) and "test" in first_arg.id.lower():
                    issues.append(Issue(
                        rule_id=self.rule_id,
                        rule_name=self.rule_name,
                        severity=self.severity,
                        file_path=str(file.path),
                        line_number=node.lineno,
                        context_line=_source_line(file, node.lineno),
                        description=f"Model fit is called directly with test dataset variable '{first_arg.id}'. Fitting on test data leads to direct data overlap.",
                        suggested_fix="Fit model on training dataset variables (e.g. X_train, y_train) instead of test variables."
                    ))

            # Case 2: Concat / merge combining train and test variables
            if short_name in {"concat", "append", "merge"}:
                arg_names = []
                for arg in ast.walk(node):
                    if isinstance(arg, ast.Name):
                        arg_names.append(arg.id.lower())
                
                if any("train" in name for name in arg_names) and any("test" in name for name in arg_names):
                    issues.append(Issue(
                        rule_id=self.rule_id,
                        rule_name=self.rule_name,
                        severity=self.severity,
                        file_path=str(file.path),
                        line_number=node.lineno,
                        context_line=_source_line(file, node.lineno),
                        description="Data merge/concat operation combines training and test variables together. This introduces dataset contamination.",
                        suggested_fix="Keep training and evaluation datasets completely isolated."
                    ))
        return issues


class TemporalLeakageRule(BaseRule):
    """Detects random split on time-series/temporal datasets."""
    rule_id = "L003"
    rule_name = "Temporal Leakage"
    severity = "major"
    description = "Random split on time-series/temporal datasets."

    TEMPORAL_KEYWORDS = {"date", "timestamp", "datetime", "time", "year", "month", "day"}

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        if not file.ast_node:
            return []

        # Check if file references time/date columns or time-series features
        has_temporal_refs = False
        for node in ast.walk(file.ast_node):
            if isinstance(node, ast.Constant) and isinstance(node.value, str):
                if any(kw in node.value.lower() for kw in self.TEMPORAL_KEYWORDS):
                    has_temporal_refs = True
                    break
            elif isinstance(node, ast.Name):
                if any(kw in node.id.lower() for kw in self.TEMPORAL_KEYWORDS):
                    has_temporal_refs = True
                    break

        if not has_temporal_refs:
            return []

        issues = []
        for node in ast.walk(file.ast_node):
            if not isinstance(node, ast.Call):
                continue
            func_name = _func_name(node.func).split(".")[-1]
            if func_name != "train_test_split":
                continue

            # Check if shuffle=True or default random split is used
            issues.append(Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=node.lineno,
                context_line=_source_line(file, node.lineno),
                description="Random train_test_split detected on a time-series/temporal dataset. Random splitting on temporal data leaks future information into past training.",
                suggested_fix="Use TimeSeriesSplit or chronological index splitting (shuffle=False) for time-dependent data."
            ))
        return issues


class FeatureLeakageRule(BaseRule):
    """Detects direct target leakage inside features."""
    rule_id = "L004"
    rule_name = "Feature Leakage"
    severity = "critical"
    description = "Direct target leakage inside features."

    TARGET_COLUMNS = {"target", "label", "churn", "price", "outcome", "survived", "salary"}

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        if not file.ast_node:
            return []

        issues = []
        for node in ast.walk(file.ast_node):
            # Case 1: X = df[["feature", "target"]] or feature assignment containing target column
            if isinstance(node, ast.Assign):
                for target_node in node.targets:
                    if isinstance(target_node, ast.Name) and target_node.id.upper() in {"X", "FEATURES"}:
                        # Inspect assigned value for target column string constants
                        for val_node in ast.walk(node.value):
                            if isinstance(val_node, ast.Constant) and isinstance(val_node.value, str):
                                if val_node.value.lower() in self.TARGET_COLUMNS:
                                    issues.append(Issue(
                                        rule_id=self.rule_id,
                                        rule_name=self.rule_name,
                                        severity=self.severity,
                                        file_path=str(file.path),
                                        line_number=node.lineno,
                                        context_line=_source_line(file, node.lineno),
                                        description=f"Target column '{val_node.value}' is explicitly included inside feature matrix {target_node.id}. This creates perfect target leakage.",
                                        suggested_fix=f"Drop target column '{val_node.value}' from feature matrix {target_node.id} before training."
                                    ))
        return issues
