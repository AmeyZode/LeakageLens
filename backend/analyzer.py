from pathlib import Path
from typing import List, Dict, Any
from leakagelens.core.ingestion import discover_files
from leakagelens.core.normalization import normalize_file
from leakagelens.core.context_builder import build_context
from leakagelens.rules import ALL_RULES
from leakagelens.reporting.scorer import calculate_health_score
from leakagelens.ai.recommendation_engine import RecommendationEngine

class PipelineAnalyzer:
    def __init__(self, ai_provider: str = "fallback", api_key: str = None):
        self.engine = RecommendationEngine(provider=ai_provider, api_key=api_key)

    def scan_path(self, target_path: str) -> Dict[str, Any]:
        path = Path(target_path).resolve()
        if not path.exists():
            raise FileNotFoundError(f"Path {target_path} does not exist.")

        files = discover_files(str(path))
        all_issues = []

        # Map to quickly load raw lines of files for code context extracts
        file_cache = {}

        for file_path in files:
            normalized = normalize_file(file_path)
            file_cache[str(file_path)] = normalized
            context = build_context(normalized)

            for rule in ALL_RULES:
                try:
                    issues = rule.analyze(normalized, context)
                    all_issues.extend(issues)
                except Exception:
                    pass

        score, counts = calculate_health_score(all_issues)

        issues_list = []
        for issue in all_issues:
            # Extract surrounding context lines for AI
            code_context = ""
            norm_file = file_cache.get(issue.file_path)
            if not norm_file:
                try:
                    norm_file = normalize_file(Path(issue.file_path))
                except Exception:
                    pass
            
            if norm_file and norm_file.raw_source:
                lines = norm_file.raw_source.splitlines()
                start = max(0, issue.line_number - 3)
                end = min(len(lines), issue.line_number + 3)
                code_context = "\n".join(lines[start:end])

            rec = self.engine.get_recommendation(issue, code_context)

            # Get relative file path to target path if it's a directory
            try:
                rel_path = str(Path(issue.file_path).relative_to(path))
            except ValueError:
                rel_path = str(Path(issue.file_path).name)

            issues_list.append({
                "rule_id": issue.rule_id,
                "rule_name": issue.rule_name,
                "severity": issue.severity,
                "file_path": rel_path,
                "line_number": issue.line_number,
                "context_line": issue.context_line,
                "description": issue.description,
                "suggested_fix": issue.suggested_fix or rec.get("fix"),
                "ai_recommendation": rec
            })

        return {
            "score": score,
            "counts": counts,
            "issues": issues_list
        }
