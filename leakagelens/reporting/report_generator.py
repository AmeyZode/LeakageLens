from typing import List, Dict
import json
from leakagelens.rules.base_rule import Issue
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

def generate_cli_report(score: int, counts: Dict[str, int], issues: List[Issue], recommendations: Dict[str, Dict[str, str]] = None):
    """Outputs a rich, styled report to stdout console."""
    console = Console()
    
    score_color = "green" if score >= 80 else ("yellow" if score >= 50 else "red")
    score_panel = Panel(
        f"[bold {score_color}]Score: {score}/100[/bold {score_color}]\n"
        f"[bold red]Critical:[/bold red] {counts.get('critical', 0)} | "
        f"[bold yellow]Major:[/bold yellow] {counts.get('major', 0)} | "
        f"[bold blue]Minor:[/bold blue] {counts.get('minor', 0)}",
        title="[bold]LeakageLens Audit Results[/bold]",
        expand=False
    )
    console.print(score_panel)
    console.print()
    
    if not issues:
        console.print("[bold green]✨ No issues detected! Clean ML Pipeline.[/bold green]")
        return
        
    table = Table(title="Detected Pipeline Issues")
    table.add_column("Severity", justify="center", style="bold")
    table.add_column("Rule", style="cyan")
    table.add_column("Location", style="magenta")
    table.add_column("Description")
    
    for issue in issues:
        severity_style = (
            "bold red" if issue.severity.lower() == "critical" 
            else ("bold yellow" if issue.severity.lower() == "major" 
            else "bold blue")
        )
        location = f"{issue.file_path}:{issue.line_number}"
        table.add_row(
            f"[{severity_style}]{issue.severity.upper()}[/{severity_style}]",
            issue.rule_name,
            location,
            issue.description
        )
        
    console.print(table)

def generate_markdown_report(score: int, counts: Dict[str, int], issues: List[Issue], recommendations: Dict[str, Dict[str, str]] = None) -> str:
    """Returns structured markdown report content."""
    lines = [
        "# LeakageLens Audit Report",
        "",
        f"**Health Score:** {score}/100",
        "",
        "## Summary of Issues",
        f"- **Critical:** {counts.get('critical', 0)}",
        f"- **Major:** {counts.get('major', 0)}",
        f"- **Minor:** {counts.get('minor', 0)}",
        "",
        "## Detailed Issues List",
        ""
    ]
    
    if not issues:
        lines.append("✨ No issues detected!")
        return "\n".join(lines)
        
    for idx, issue in enumerate(issues, start=1):
        lines.append(f"### {idx}. {issue.rule_name} ({issue.severity.upper()})")
        lines.append(f"- **File:** `{issue.file_path}`")
        lines.append(f"- **Line:** {issue.line_number}")
        lines.append(f"- **Description:** {issue.description}")
        if issue.suggested_fix:
            lines.append(f"- **Suggested Fix:** {issue.suggested_fix}")
        
        rec = None
        if recommendations:
            rec = recommendations.get(issue.rule_id)
        if rec and rec.get("explanation"):
            lines.append(f"- **AI Explanation:** {rec.get('explanation')}")
        if rec and rec.get("fix"):
            lines.append(f"- **AI Fix Recommendation:**\n```python\n{rec.get('fix')}\n```")
        lines.append("")
        
    return "\n".join(lines)

def generate_json_report(score: int, counts: Dict[str, int], issues: List[Issue], recommendations: Dict[str, Dict[str, str]] = None) -> str:
    """Returns structured JSON report content."""
    report_dict = {
        "score": score,
        "counts": counts,
        "issues": [
            {
                "rule_id": issue.rule_id,
                "rule_name": issue.rule_name,
                "severity": issue.severity,
                "file_path": issue.file_path,
                "line_number": issue.line_number,
                "context_line": issue.context_line,
                "description": issue.description,
                "suggested_fix": issue.suggested_fix,
                "ai_recommendation": recommendations.get(issue.rule_id) if recommendations else None
            }
            for issue in issues
        ]
    }
    return json.dumps(report_dict, indent=2)
