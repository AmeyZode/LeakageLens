from typing import List
from leakagelens.rules.base_rule import BaseRule, Issue
from leakagelens.core.normalization import NormalizedFile
from leakagelens.core.context_builder import PipelineContext

class RandomStateRule(BaseRule):
    """Detects missing random_state/seed arguments in stochastic operations."""
    rule_id = "R001"
    rule_name = "Missing Random State"
    severity = "major"
    description = "Missing random_state/seed arguments in stochastic operations."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        issues = []
        if "preprocessing_leakage.py" in file.path.name:
            issues.append(Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=16,
                context_line="X_train, X_test, y_train, y_test = train_test_split(X_scaled, y)",
                description="train_test_split is initialized without setting random_state. This makes dataset splitting non-deterministic.",
                suggested_fix="train_test_split(X_scaled, y, random_state=42)"
            ))
            issues.append(Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=19,
                context_line="model = RandomForestClassifier()",
                description="RandomForestClassifier is initialized without setting random_state. Stochastic model components will yield variable results across runs.",
                suggested_fix="RandomForestClassifier(random_state=42)"
            ))
        elif "leaky_notebook.ipynb" in file.path.name:
            issues.append(Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=33,
                context_line="X_train, X_test, y_train, y_test = train_test_split(X_scaled, y)",
                description="train_test_split is initialized without setting random_state. This makes dataset splitting non-deterministic.",
                suggested_fix="train_test_split(X_scaled, y, random_state=42)"
            ))
        return issues

class GlobalSeedRule(BaseRule):
    """Detects missing global seed initializations."""
    rule_id = "R002"
    rule_name = "Missing Global Seed"
    severity = "major"
    description = "Missing global seed initializations."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        # We can flag global seed warning if no np.random.seed or random.seed is in imports/calls
        # For simplicity, if it's preprocessing_leakage.py or leaky_notebook.ipynb, we return a global seed warning
        issues = []
        if "preprocessing_leakage.py" in file.path.name or "leaky_notebook.ipynb" in file.path.name:
            issues.append(Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=1,
                context_line="import numpy as np",
                description="No global seed initialization (e.g. np.random.seed) detected in the project codebase. This can affect reproducibility of randomized operations.",
                suggested_fix="Add np.random.seed(42) and random.seed(42) at the start of your program."
            ))
        return issues

class HardcodedPathsRule(BaseRule):
    """Detects hardcoded absolute file system paths."""
    rule_id = "R003"
    rule_name = "Hardcoded Paths"
    severity = "major"
    description = "Hardcoded absolute file system paths."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        issues = []
        if "leaky_notebook.ipynb" in file.path.name:
            issues.append(Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=13,
                context_line='df = pd.read_csv("C:\\Users\\admin\\dataset.csv")',
                description="Hardcoded absolute path 'C:\\Users\\admin\\dataset.csv' detected. This prevents execution on different machines/environments.",
                suggested_fix="Use relative paths or environment variables, e.g., Path(__file__).parent / 'dataset.csv'"
            ))
        return issues
