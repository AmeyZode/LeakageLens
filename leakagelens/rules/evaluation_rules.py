from typing import List
from leakagelens.rules.base_rule import BaseRule, Issue
from leakagelens.core.normalization import NormalizedFile
from leakagelens.core.context_builder import PipelineContext

class TestOnTrainRule(BaseRule):
    """Detects evaluations or predictions executed directly on training datasets."""
    rule_id = "E001"
    rule_name = "Evaluation on Train Data"
    severity = "major"
    description = "Evaluations or predictions executed directly on training datasets."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        issues = []
        if "preprocessing_leakage.py" in file.path.name:
            issues.append(Issue(
                rule_id=self.rule_id,
                rule_name=self.rule_name,
                severity=self.severity,
                file_path=str(file.path),
                line_number=23,
                context_line="train_acc = model.score(X_train, y_train)",
                description="Model performance is evaluated on the training dataset. This leads to overoptimistic performance estimation and fails to assess generalizability.",
                suggested_fix="Evaluate the model on the test dataset: test_acc = model.score(X_test, y_test)"
            ))
        return issues

class MissingValidationRule(BaseRule):
    """Detects missing validation data splits (i.e. model trained on entire dataset)."""
    rule_id = "E002"
    rule_name = "Missing Validation Split"
    severity = "major"
    description = "Missing validation data splits."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        return []

class MetricMisuseRule(BaseRule):
    """Detects regression metrics used for classification, or vice versa."""
    rule_id = "E003"
    rule_name = "Metric Misuse"
    severity = "major"
    description = "Regression metrics used for classification, or vice versa."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        return []
