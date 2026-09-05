import ast
from typing import List
from leakagelens.rules.base_rule import BaseRule, Issue
from leakagelens.core.normalization import NormalizedFile
from leakagelens.core.context_builder import PipelineContext


def _source_line(file: NormalizedFile, line_number: int) -> str:
    lines = file.raw_source.splitlines()
    if 1 <= line_number <= len(lines):
        return lines[line_number - 1].strip()
    return ""


class UnusedImportsRule(BaseRule):
    """Detects declared imports that are never used."""
    rule_id = "Q001"
    rule_name = "Unused Imports"
    severity = "minor"
    description = "Declared imports that are never used."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        if not file.ast_node:
            return []

        imported_names = {}
        for node in ast.walk(file.ast_node):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    name = alias.asname or alias.name
                    imported_names[name] = (node.lineno, alias.name)
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    name = alias.asname or alias.name
                    imported_names[name] = (node.lineno, f"{node.module}.{alias.name}")

        if not imported_names:
            return []

        # Find all name usages
        used_names = set()
        for node in ast.walk(file.ast_node):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                continue
            if isinstance(node, ast.Name):
                used_names.add(node.id)
            elif isinstance(node, ast.Attribute):
                if isinstance(node.value, ast.Name):
                    used_names.add(node.value.id)

        issues = []
        for name, (lineno, orig_import) in imported_names.items():
            if name not in used_names and not name.startswith("_"):
                issues.append(Issue(
                    rule_id=self.rule_id,
                    rule_name=self.rule_name,
                    severity=self.severity,
                    file_path=str(file.path),
                    line_number=lineno,
                    context_line=_source_line(file, lineno),
                    description=f"Imported module/symbol '{name}' ({orig_import}) is never used in this file.",
                    suggested_fix=f"Remove unused import '{name}' to keep code clean and reduce load overhead."
                ))
        return issues


class UnusedVariablesRule(BaseRule):
    """Detects assigned variables that are never read."""
    rule_id = "Q002"
    rule_name = "Unused Variables"
    severity = "minor"
    description = "Assigned variables that are never read."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        if not file.ast_node:
            return []

        # Track local assignments inside functions
        assigned_vars = {}
        read_vars = set()

        for node in ast.walk(file.ast_node):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        if not target.id.startswith("_") and target.id not in {"X", "y", "df", "model"}:
                            assigned_vars[target.id] = (node.lineno, target.id)
            elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
                read_vars.add(node.id)

        issues = []
        for var_name, (lineno, _) in assigned_vars.items():
            if var_name not in read_vars:
                issues.append(Issue(
                    rule_id=self.rule_id,
                    rule_name=self.rule_name,
                    severity=self.severity,
                    file_path=str(file.path),
                    line_number=lineno,
                    context_line=_source_line(file, lineno),
                    description=f"Variable '{var_name}' is assigned but never read elsewhere in the scope.",
                    suggested_fix=f"Remove unreferenced variable '{var_name}' or check for typos."
                ))
        return issues


class ComplexityRule(BaseRule):
    """Detects functions with excessive length or arguments."""
    rule_id = "Q003"
    rule_name = "High Complexity"
    severity = "minor"
    description = "Functions with excessive length or arguments."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        if not file.ast_node:
            return []

        issues = []
        for node in ast.walk(file.ast_node):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                stmt_count = len(node.body)
                arg_count = len(node.args.args)

                if stmt_count > 35 or arg_count > 6:
                    issues.append(Issue(
                        rule_id=self.rule_id,
                        rule_name=self.rule_name,
                        severity=self.severity,
                        file_path=str(file.path),
                        line_number=node.lineno,
                        context_line=_source_line(file, node.lineno),
                        description=f"Function '{node.name}' has high complexity ({stmt_count} statements, {arg_count} parameters).",
                        suggested_fix=f"Refactor '{node.name}' into smaller, modular functions to improve readability and testability."
                    ))
        return issues


class DocumentationRule(BaseRule):
    """Detects function definitions lacking docstrings."""
    rule_id = "Q004"
    rule_name = "Missing Docstring"
    severity = "minor"
    description = "Function definitions lacking docstrings."

    def analyze(self, file: NormalizedFile, context: PipelineContext) -> List[Issue]:
        if not file.ast_node:
            return []

        issues = []
        for node in ast.walk(file.ast_node):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if not node.name.startswith("_") and ast.get_docstring(node) is None:
                    issues.append(Issue(
                        rule_id=self.rule_id,
                        rule_name=self.rule_name,
                        severity=self.severity,
                        file_path=str(file.path),
                        line_number=node.lineno,
                        context_line=_source_line(file, node.lineno),
                        description=f"Function '{node.name}' is missing a docstring documentation string.",
                        suggested_fix=f"Add a clear docstring to function '{node.name}' describing inputs, behavior, and return values."
                    ))
        return issues
