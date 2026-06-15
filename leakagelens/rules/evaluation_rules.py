from typing import List
from leakagelens.rules.base_rule import BaseRule, Issue
from leakagelens.core.normalization import NormalizedFile
from leakagelens.core.context_builder import PipelineContext

class TestOnTrainRule(BaseRule):
    """Detects evaluations or predictions executed directly on training datasets."""
    pass

class MissingValidationRule(BaseRule):
    """Detects missing validation data splits (i.e. model trained on entire dataset)."""
    pass

class MetricMisuseRule(BaseRule):
    """Detects regression metrics used for classification, or vice versa."""
    pass
