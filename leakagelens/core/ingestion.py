from pathlib import Path
from typing import List

def discover_files(directory_path: str) -> List[Path]:
    """
    Scan the target directory recursively and find all files of supported extensions.
    Skipping virtual environments and standard ignored folders.
    """
    supported_extensions = {".py", ".ipynb"}
    ignored_dirs = {
        ".git",
        ".venv",
        "venv",
        "node_modules",
        "__pycache__",
        ".ipynb_checkpoints",
        "leakagelens.egg-info",
        "dist",
        "build",
    }
    
    root = Path(directory_path).resolve()
    found_files = []
    
    if root.is_file():
        if root.suffix in supported_extensions:
            return [root]
        return []
        
    for path in root.rglob("*"):
        try:
            relative_parts = path.relative_to(root).parts
            if any(part in ignored_dirs for part in relative_parts):
                continue
        except ValueError:
            continue
            
        if path.is_file() and path.suffix in supported_extensions:
            found_files.append(path)
            
    return sorted(found_files)
