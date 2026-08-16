import ast
import re
from typing import List
from leakagelens.rules.base_rule import BaseRule, Issue
from leakagelens.core.normalization import NormalizedFile
from leakagelens.core.context_builder import PipelineContext


STOCHASTIC_CALLS = {
    "train_test_split",
    "RandomForestClassifier",
    "RandomForestRegressor",
    "ExtraTreesClassifier",
    "ExtraTreesRegressor",
    "GradientBoostingClassifier",
    "GradientBoostingRegressor",
    "KMeans",
    "PCA",
    "SGDClassifier",
    "SGDRegressor",
}

SEED_CALLS = {
    "random.seed",
    "np.random.seed",
    "numpy.random.seed",
    "torch.manual_seed",
    "tensorflow.random.set_seed",
    "tf.random.set_seed",
    "seed_everything",
}


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


def _has_keyword(node: ast.Call, keyword: str) -> bool:
    return any(kw.arg == keyword for kw in node.keywords)


def _stochastic_calls(file: NormalizedFile) -> List[ast.Call]:
    if not file.ast_node:
        return []
    return [
        node
        for node in ast.walk(file.ast_node)
        if isinstance(node, ast.Call) and _func_name(node.func).split(".")[-1] in STOCHASTIC_CALLS
    ]

class RandomStateRule(BaseRule):
    """Detects missing random_state/seed arguments in stochastic operations."""
    rule_id = "R001"
    rule_name = "Missing Random State"
    severity = "major"
    description = "Missing random_state/seed arguments in stochastic operations."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        issues = []
        for node in _stochastic_calls(file):
            name = _func_name(node.func).split(".")[-1]
            if _has_keyword(node, "random_state"):
                continue

            issues.append(Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=node.lineno,
                context_line=_source_line(file, node.lineno),
                description=f"{name} is called without random_state, making stochastic behavior non-deterministic across runs.",
                suggested_fix=f"Pass random_state=42 to {name} or wire a project-level seed constant."
            ))
        return issues

class GlobalSeedRule(BaseRule):
    """Detects missing global seed initializations."""
    rule_id = "R002"
    rule_name = "Missing Global Seed"
    severity = "major"
    description = "Missing global seed initializations."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        if not file.ast_node or not _stochastic_calls(file):
            return []

        has_seed = any(
            isinstance(node, ast.Call) and _func_name(node.func) in SEED_CALLS
            for node in ast.walk(file.ast_node)
        )
        if has_seed:
            return []

        first_line = min(node.lineno for node in _stochastic_calls(file))
        return [Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=first_line,
                context_line=_source_line(file, first_line),
                description="Stochastic operations are present, but no global seed initialization was detected in this file.",
                suggested_fix="Initialize project seeds near startup, for example random.seed(42) and np.random.seed(42)."
            )]

class HardcodedPathsRule(BaseRule):
    """Detects hardcoded absolute file system paths."""
    rule_id = "R003"
    rule_name = "Hardcoded Paths"
    severity = "major"
    description = "Hardcoded absolute file system paths."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        if not file.ast_node:
            return []

        issues = []
        windows_path = re.compile(r"^[a-zA-Z]:[\\/]")
        for node in ast.walk(file.ast_node):
            if not isinstance(node, ast.Constant) or not isinstance(node.value, str):
                continue

            value = node.value
            if not (value.startswith("/") or value.startswith("~/") or windows_path.match(value)):
                continue

            issues.append(Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=node.lineno,
                context_line=_source_line(file, node.lineno),
                description=f"Hardcoded absolute path '{value}' detected. This can break execution across machines and environments.",
                suggested_fix="Use relative paths, configuration, or environment variables instead of machine-specific absolute paths."
            ))
        return issues
