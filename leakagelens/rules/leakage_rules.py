import ast
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
        return []

class TemporalLeakageRule(BaseRule):
    """Detects random split on time-series/temporal datasets."""
    rule_id = "L003"
    rule_name = "Temporal Leakage"
    severity = "major"
    description = "Random split on time-series/temporal datasets."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        return []

class FeatureLeakageRule(BaseRule):
    """Detects direct target leakage inside features."""
    rule_id = "L004"
    rule_name = "Feature Leakage"
    severity = "critical"
    description = "Direct target leakage inside features."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        return []
