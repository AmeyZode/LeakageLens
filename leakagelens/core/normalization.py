from pathlib import Path
from typing import Any, Optional, Dict, Tuple, List
import ast
import json

class NormalizedFile:
    """Represents a file normalized into its AST or structured config dictionary."""
    def __init__(
        self, 
        path: Path, 
        content_type: str, 
        raw_source: str, 
        ast_node: Optional[Any] = None, 
        config_data: Optional[Any] = None,
        ipynb_line_map: Optional[Dict[int, Tuple[int, int]]] = None
    ):
        self.path = path
        self.content_type = content_type
        self.raw_source = raw_source
        self.ast_node = ast_node
        self.config_data = config_data
        self.ipynb_line_map = ipynb_line_map  # Maps stitched line index (1-based) -> (cell_index, line_in_cell)

def normalize_file(path: Path) -> NormalizedFile:
    """
    Determine file type and parse it:
    - Python files are parsed into AST.
    - Jupyter Notebooks code cells are stitched and compiled into AST.
    - YAML/JSON configurations are parsed into a dictionary.
    """
    path = Path(path)
    suffix = path.suffix.lower()
    
    if suffix == ".py":
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            raw_source = f.read()
        try:
            ast_node = ast.parse(raw_source)
        except SyntaxError:
            ast_node = None
        return NormalizedFile(path, "python", raw_source, ast_node=ast_node)
        
    elif suffix == ".ipynb":
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            try:
                notebook_data = json.load(f)
            except Exception:
                return NormalizedFile(path, "notebook", "", ast_node=None)
                
        stitched_lines = []
        line_map = {}
        current_line = 1
        
        cells = notebook_data.get("cells", [])
        for cell_idx, cell in enumerate(cells):
            if cell.get("cell_type") == "code":
                source_field = cell.get("source", [])
                # The source can be a string or a list of strings
                if isinstance(source_field, str):
                    cell_lines = source_field.splitlines(keepends=True)
                else:
                    cell_lines = source_field
                
                # Add cell header comment
                stitched_lines.append(f"# CELL {cell_idx}\n")
                line_map[current_line] = (cell_idx, 0)
                current_line += 1
                
                for line_in_cell, line_content in enumerate(cell_lines, start=1):
                    # Ensure each line ends with a newline
                    line_to_add = line_content
                    if not line_to_add.endswith("\n"):
                        line_to_add += "\n"
                    stitched_lines.append(line_to_add)
                    line_map[current_line] = (cell_idx, line_in_cell)
                    current_line += 1
                    
                # Add separator newline
                stitched_lines.append("\n")
                line_map[current_line] = (cell_idx, 0)
                current_line += 1
                
        stitched_source = "".join(stitched_lines)
        try:
            ast_node = ast.parse(stitched_source)
        except SyntaxError:
            ast_node = None
            
        return NormalizedFile(
            path, 
            "notebook", 
            stitched_source, 
            ast_node=ast_node, 
            ipynb_line_map=line_map
        )
        
    elif suffix in (".json", ".yaml", ".yml"):
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        config_data = None
        if suffix == ".json":
            try:
                config_data = json.loads(content)
            except Exception:
                pass
        else:
            # Simple YAML parser fallback in case pyyaml is not fully imported/working, or import pyyaml
            try:
                import yaml
                config_data = yaml.safe_load(content)
            except Exception:
                pass
        return NormalizedFile(path, "config", content, config_data=config_data)
        
    else:
        # Default fallback
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        return NormalizedFile(path, "unknown", content)
