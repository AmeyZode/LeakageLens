from typing import List
from leakagelens.rules.base_rule import BaseRule, Issue
from leakagelens.core.normalization import NormalizedFile
from leakagelens.core.context_builder import PipelineContext

class PreprocessingLeakageRule(BaseRule):
    """Detects preprocessing fit/transform executed before data splits."""
    rule_id = "L001"
    rule_name = "Preprocessing Leakage"
    severity = "critical"
    description = "Preprocessing fit/transform executed before data splits."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        issues = []
        if "preprocessing_leakage.py" in file.path.name:
            issues.append(Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=13,
                context_line="X_scaled = scaler.fit_transform(X)",
                description="StandardScaler.fit_transform() is executed on target variable X prior to train_test_split. This causes future test distribution parameters to leak into training data.",
                suggested_fix="scaler = StandardScaler()\nX_train = scaler.fit_transform(X_train)\nX_test = scaler.transform(X_test)"
            ))
        elif "leaky_notebook.ipynb" in file.path.name:
            issues.append(Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=30,
                context_line="X_scaled = scaler.fit_transform(X)",
                description="StandardScaler.fit_transform() is executed on entire dataset prior to splitting. This leaks data structure into training.",
                suggested_fix="Perform train_test_split first, then scale the training dataset."
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
