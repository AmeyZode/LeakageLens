from typing import List, Tuple, Dict
from leakagelens.rules.base_rule import Issue

def calculate_health_score(issues: List[Issue]) -> Tuple[int, Dict[str, int]]:
    """Calculates overall project health score based on count and severity of issues."""
    counts = {"critical": 0, "major": 0, "minor": 0}
    for issue in issues:
        severity = issue.severity.lower()
        if severity in counts:
            counts[severity] += 1
        else:
            # Fallback for unexpected severity names
            counts["minor"] = counts.get("minor", 0) + 1
            
    deductions = (
        counts["critical"] * 15 +
        counts["major"] * 10 +
        counts["minor"] * 5
    )
    score = max(0, 100 - deductions)
    return score, counts
