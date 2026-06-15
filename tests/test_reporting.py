from leakagelens.reporting.scorer import calculate_health_score
from leakagelens.reporting.report_generator import generate_cli_report

def test_reporting_imports():
    assert calculate_health_score is not None
    assert generate_cli_report is not None
