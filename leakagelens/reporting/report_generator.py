from typing import List, Dict
from leakagelens.rules.base_rule import Issue

def generate_cli_report(score: int, counts: Dict[str, int], issues: List[Issue], recommendations: Dict[str, Dict[str, str]]):
    """Outputs a rich, styled report to stdout console."""
    pass

def generate_markdown_report(score: int, counts: Dict[str, int], issues: List[Issue], recommendations: Dict[str, Dict[str, str]]) -> str:
    """Returns structured markdown report content."""
    pass

def generate_json_report(score: int, counts: Dict[str, int], issues: List[Issue], recommendations: Dict[str, Dict[str, str]]) -> str:
    """Returns structured JSON report content."""
    pass
