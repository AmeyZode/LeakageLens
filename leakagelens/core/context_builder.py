from pathlib import Path
from leakagelens.core.normalization import NormalizedFile

class PipelineContext:
    """Stores the extracted pipeline metadata like imports, variables, calls, and data flows."""
    def __init__(self, file_path: Path):
        pass

def build_context(normalized_file: NormalizedFile) -> PipelineContext:
    """Walks the AST tree of the normalized file to compile the pipeline context."""
    pass
