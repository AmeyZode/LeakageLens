from typing import List
from leakagelens.rules.base_rule import BaseRule, Issue
from leakagelens.core.normalization import NormalizedFile
from leakagelens.core.context_builder import PipelineContext

class PreprocessingLeakageRule(BaseRule):
    """Detects preprocessing fit/transform executed before data splits."""
    pass

class OverlapLeakageRule(BaseRule):
    """Detects train/test datasets overlap or illegal combinations."""
    pass

class TemporalLeakageRule(BaseRule):
    """Detects random split on time-series/temporal datasets."""
    pass

class FeatureLeakageRule(BaseRule):
    """Detects direct target leakage inside features."""
    pass
