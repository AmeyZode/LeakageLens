from pathlib import Path
import ast
from leakagelens.core.normalization import NormalizedFile

class ASTContextCollector(ast.NodeVisitor):
    def __init__(self):
        self.imports = []
        self.assignments = {}
        self.calls = []

    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append(alias.name)
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        module = node.module or ""
        for alias in node.names:
            self.imports.append(f"{module}.{alias.name}" if module else alias.name)
        self.generic_visit(node)

    def visit_Assign(self, node):
        value_desc = self._get_node_desc(node.value)
        for target in node.targets:
            if isinstance(target, ast.Name):
                self.assignments[target.id] = {
                    "node": node.value,
                    "desc": value_desc
                }
        self.generic_visit(node)

    def visit_Call(self, node):
        call_info = {
            "node": node,
            "func_name": self._get_func_name(node.func),
            "args": [self._get_node_desc(arg) for arg in node.args],
            "keywords": {kw.arg: self._get_node_desc(kw.value) for kw in node.keywords if kw.arg is not None}
        }
        self.calls.append(call_info)
        self.generic_visit(node)

    def _get_func_name(self, node):
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            val_name = self._get_func_name(node.value)
            return f"{val_name}.{node.attr}" if val_name else node.attr
        return ""

    def _get_node_desc(self, node):
        if isinstance(node, ast.Constant):
            return str(node.value)
        elif isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Call):
            return f"Call({self._get_func_name(node.func)})"
        return ""

class PipelineContext:
    """Stores the extracted pipeline metadata like imports, variables, calls, and data flows."""
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.imports = []
        self.assignments = {}
        self.calls = []

def build_context(normalized_file: NormalizedFile) -> PipelineContext:
    """Walks the AST tree of the normalized file to compile the pipeline context."""
    context = PipelineContext(normalized_file.path)
    if not normalized_file.ast_node:
        return context
        
    collector = ASTContextCollector()
    collector.visit(normalized_file.ast_node)
    
    context.imports = collector.imports
    context.assignments = collector.assignments
    context.calls = collector.calls
    return context
