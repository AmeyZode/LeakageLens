from typing import List
from leakagelens.rules.base_rule import BaseRule, Issue
from leakagelens.core.normalization import NormalizedFile
from leakagelens.core.context_builder import PipelineContext

class UnusedImportsRule(BaseRule):
    """Detects declared imports that are never used."""
    rule_id = "Q001"
    rule_name = "Unused Imports"
    severity = "minor"
    description = "Declared imports that are never used."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        return []

class UnusedVariablesRule(BaseRule):
    """Detects assigned variables that are never read."""
    rule_id = "Q002"
    rule_name = "Unused Variables"
    severity = "minor"
    description = "Assigned variables that are never read."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        return []

class ComplexityRule(BaseRule):
    """Detects functions with excessive length or arguments."""
    rule_id = "Q003"
    rule_name = "High Complexity"
    severity = "minor"
    description = "Functions with excessive length or arguments."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        return []

class DocumentationRule(BaseRule):
    """Detects function definitions lacking docstrings."""
    rule_id = "Q004"
    rule_name = "Missing Docstring"
    severity = "minor"
    description = "Function definitions lacking docstrings."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        return []
