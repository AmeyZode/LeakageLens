from typing import List
from leakagelens.rules.base_rule import BaseRule, Issue
from leakagelens.core.normalization import NormalizedFile
from leakagelens.core.context_builder import PipelineContext

class RandomStateRule(BaseRule):
    """Detects missing random_state/seed arguments in stochastic operations."""
    pass

class GlobalSeedRule(BaseRule):
    """Detects missing global seed initializations."""
    pass

class HardcodedPathsRule(BaseRule):
    """Detects hardcoded absolute file system paths."""
    pass
