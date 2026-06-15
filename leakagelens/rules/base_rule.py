from typing import List, Optional
from pydantic import BaseModel
from leakagelens.core.normalization import NormalizedFile
from leakagelens.core.context_builder import PipelineContext

class Issue(BaseModel):
    """Represents a rule violation detected in a file."""
    rule_id: str
    rule_name: str
    severity: str
    file_path: str
    line_number: int
    context_line: str
    description: str
    suggested_fix: Optional[str] = None

class BaseRule:
    """Base class that all ML pipeline audit rules must subclass."""
    rule_id: str = "BASE"
    rule_name: str = "Base Rule"
    severity: str = "minor"
    description: str = ""

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        raise NotImplementedError
