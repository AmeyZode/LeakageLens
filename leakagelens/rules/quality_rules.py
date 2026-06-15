from typing import List
from leakagelens.rules.base_rule import BaseRule, Issue
from leakagelens.core.normalization import NormalizedFile
from leakagelens.core.context_builder import PipelineContext

class UnusedImportsRule(BaseRule):
    """Detects declared imports that are never used."""
    pass

class UnusedVariablesRule(BaseRule):
    """Detects assigned variables that are never read."""
    pass

class ComplexityRule(BaseRule):
    """Detects functions with excessive length or arguments."""
    pass

class DocumentationRule(BaseRule):
    """Detects function definitions lacking docstrings."""
    pass
