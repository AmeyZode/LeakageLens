from pathlib import Path
from typing import List, Dict, Any
import logging
from leakagelens.core.ingestion import discover_files
from leakagelens.core.normalization import normalize_file
from leakagelens.core.context_builder import build_context
from leakagelens.rules import ALL_RULES
from leakagelens.reporting.scorer import calculate_health_score
from leakagelens.ai.recommendation_engine import RecommendationEngine

from leakagelens.ml.leakage_detector_model import MLLeakageDetector

logger = logging.getLogger(__name__)

class PipelineAnalyzer:
    def __init__(self, ai_provider: str = "groq", api_key: str = None):
        self.engine = RecommendationEngine(provider=ai_provider, api_key=api_key)
        self.ml_detector = MLLeakageDetector()

    def scan_path(self, target_path: str) -> Dict[str, Any]:
        path = Path(target_path).resolve()
        if not path.exists():
            raise FileNotFoundError(f"Path {target_path} does not exist.")

        files = discover_files(str(path))
        all_issues = []
        rule_errors = []

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
                except Exception as exc:
                    error = {
                        "file_path": str(file_path),
                        "rule_id": rule.rule_id,
                        "rule_name": rule.rule_name,
                        "error": str(exc),
                    }
                    rule_errors.append(error)
                    logger.warning(
                        "Rule %s failed on %s: %s",
                        rule.rule_id,
                        file_path,
                        exc,
                        exc_info=True,
                    )

        score, counts = calculate_health_score(all_issues)

        # Predict ML Leakage Risk across scanned files
        ml_scores = []
        all_ml_breakdowns = []
        for norm_file in file_cache.values():
            try:
                ml_res = self.ml_detector.predict_leakage_risk(norm_file)
                ml_scores.append(ml_res["ml_risk_score"])
                all_ml_breakdowns.extend(ml_res.get("feature_importances", []))
            except Exception:
                pass

        avg_ml_risk = round(sum(ml_scores) / len(ml_scores), 1) if ml_scores else 0.0
        ml_label = "CRITICAL_LEAKAGE_RISK" if avg_ml_risk >= 70.0 else ("SUSPICIOUS_PIPELINE" if avg_ml_risk >= 35.0 else "CLEAN_PIPELINE")

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
            "issues": issues_list,
            "files_scanned": len(files),
            "rule_errors": rule_errors,
            "ml_insights": {
                "ml_risk_score": avg_ml_risk,
                "confidence_label": ml_label,
                "feature_importances": all_ml_breakdowns[:4]
            }
        }
