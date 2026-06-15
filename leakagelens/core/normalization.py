from pathlib import Path
from typing import Any, Optional

class NormalizedFile:
    """Represents a file normalized into its AST or structured config dictionary."""
    def __init__(self, path: Path, content_type: str, raw_source: str, ast_node: Optional[Any] = None, config_data: Optional[Any] = None):
        pass

def normalize_file(path: Path) -> NormalizedFile:
    """
    Determine file type and parse it:
    - Python files are parsed into AST.
    - Jupyter Notebooks code cells are stitched and compiled into AST.
    - YAML/JSON configurations are parsed into a dictionary.
    """
    pass
