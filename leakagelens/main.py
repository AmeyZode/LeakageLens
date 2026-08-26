import typer
import os
from pathlib import Path
from typing import Optional

from leakagelens.core.ingestion import discover_files
from leakagelens.core.normalization import normalize_file
from leakagelens.core.context_builder import build_context
from leakagelens.rules import ALL_RULES
from leakagelens.reporting.scorer import calculate_health_score
from leakagelens.reporting.report_generator import (
    generate_cli_report,
    generate_markdown_report,
    generate_json_report
)
from leakagelens.ai.recommendation_engine import RecommendationEngine

app = typer.Typer(help="LeakageLens CLI - AI-Powered ML Pipeline Auditor")

@app.callback()
def main():
    """LeakageLens CLI - AI-Powered ML Pipeline Auditor"""
    pass

@app.command("audit")
def audit(
    path: str = typer.Argument(".", help="The target directory or file to audit"),
    ai: str = typer.Option("fallback", "--ai", help="AI provider (fallback or openai)"),
    api_key: Optional[str] = typer.Option(None, "--api-key", help="OpenAI API key"),
    format: str = typer.Option("text", "--format", help="Output format: text, json, markdown"),
    output: Optional[str] = typer.Option(None, "--output", help="Optional file path to write report to")
):
    """Scan and audit machine learning codebases."""
    target_path = Path(path).resolve()
    if not target_path.exists():
        typer.echo(f"Error: Path {path} does not exist.", err=True)
        raise typer.Exit(code=1)
        
    # 1. Discover files
    files = discover_files(str(target_path))
    
    # 2. Analyze files
    all_issues = []
    file_cache = {}
    engine = RecommendationEngine(provider=ai, api_key=api_key or os.getenv("OPENAI_API_KEY"))
    
    for file_path in files:
        normalized = normalize_file(file_path)
        file_cache[str(file_path)] = normalized
        context = build_context(normalized)
        
        for rule in ALL_RULES:
            try:
                issues = rule.analyze(normalized, context)
                all_issues.extend(issues)
            except Exception as e:
                typer.echo(f"Warning: Rule {rule.rule_name} failed on {file_path.name}: {e}", err=True)
                
    # 3. Calculate score
    score, counts = calculate_health_score(all_issues)
    
    # 4. Generate recommendations
    recommendations = {}
    for issue in all_issues:
        # Extract surrounding context lines for AI
        code_context = ""
        issue_file = file_cache.get(issue.file_path)
        if issue_file and issue_file.raw_source:
            lines = issue_file.raw_source.splitlines()
            start = max(0, issue.line_number - 3)
            end = min(len(lines), issue.line_number + 3)
            code_context = "\n".join(lines[start:end])
            
        rec = engine.get_recommendation(issue, code_context)
        recommendations[issue.rule_id] = rec
        
    # 5. Output report
    if format == "json":
        report_str = generate_json_report(score, counts, all_issues, recommendations)
        if output:
            with open(output, "w", encoding="utf-8") as f:
                f.write(report_str)
        else:
            typer.echo(report_str)
            
    elif format == "markdown" or format == "md":
        report_str = generate_markdown_report(score, counts, all_issues, recommendations)
        if output:
            with open(output, "w", encoding="utf-8") as f:
                f.write(report_str)
        else:
            typer.echo(report_str)
            
    else:
        # Default text/CLI output
        generate_cli_report(score, counts, all_issues, recommendations)
        if output:
            report_str = generate_markdown_report(score, counts, all_issues, recommendations)
            with open(output, "w", encoding="utf-8") as f:
                f.write(report_str)

if __name__ == "__main__":
    app()
