from leakagelens.core.context_builder import build_context
from leakagelens.core.normalization import normalize_file
from leakagelens.rules import ALL_RULES, BaseRule
from leakagelens.rules.evaluation_rules import TestOnTrainRule
from leakagelens.rules.leakage_rules import PreprocessingLeakageRule
from leakagelens.rules.reproducibility_rules import (
    GlobalSeedRule,
    HardcodedPathsRule,
    RandomStateRule,
)

def test_rules_imports():
    assert ALL_RULES is not None
    assert BaseRule is not None


def _analyze_source(tmp_path, source, rule):
    path = tmp_path / "pipeline.py"
    path.write_text(source, encoding="utf-8")
    normalized = normalize_file(path)
    context = build_context(normalized)
    return rule.analyze(normalized, context)


def test_preprocessing_leakage_detects_fit_transform_before_split(tmp_path):
    source = """
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, random_state=42)
"""

    issues = _analyze_source(tmp_path, source, PreprocessingLeakageRule())

    assert len(issues) == 1
    assert issues[0].rule_id == "L001"
    assert issues[0].line_number == 6


def test_preprocessing_leakage_allows_fit_after_split(tmp_path):
    source = """
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
"""

    issues = _analyze_source(tmp_path, source, PreprocessingLeakageRule())

    assert issues == []


def test_random_state_rule_detects_stochastic_calls_without_random_state(tmp_path):
    source = """
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y)
model = RandomForestClassifier()
"""

    issues = _analyze_source(tmp_path, source, RandomStateRule())

    assert [issue.rule_id for issue in issues] == ["R001", "R001"]
    assert {issue.line_number for issue in issues} == {5, 6}


def test_random_state_rule_allows_explicit_random_state(tmp_path):
    source = """
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)
model = RandomForestClassifier(random_state=42)
"""

    issues = _analyze_source(tmp_path, source, RandomStateRule())

    assert issues == []


def test_global_seed_rule_detects_missing_seed_when_stochastic_code_exists(tmp_path):
    source = """
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(random_state=42)
"""

    issues = _analyze_source(tmp_path, source, GlobalSeedRule())

    assert len(issues) == 1
    assert issues[0].rule_id == "R002"


def test_global_seed_rule_allows_seed_initialization(tmp_path):
    source = """
import numpy as np
from sklearn.ensemble import RandomForestClassifier

np.random.seed(42)
model = RandomForestClassifier(random_state=42)
"""

    issues = _analyze_source(tmp_path, source, GlobalSeedRule())

    assert issues == []


def test_hardcoded_paths_rule_detects_absolute_paths(tmp_path):
    source = r'''
import pandas as pd

df = pd.read_csv("C:\\Users\\admin\\dataset.csv")
other = "/var/data/input.csv"
'''

    issues = _analyze_source(tmp_path, source, HardcodedPathsRule())

    assert [issue.rule_id for issue in issues] == ["R003", "R003"]
    assert {issue.line_number for issue in issues} == {4, 5}


def test_hardcoded_paths_rule_allows_relative_paths(tmp_path):
    source = """
import pandas as pd

df = pd.read_csv("data/input.csv")
"""

    issues = _analyze_source(tmp_path, source, HardcodedPathsRule())

    assert issues == []


def test_evaluation_rule_detects_training_data_scoring(tmp_path):
    source = """
train_acc = model.score(X_train, y_train)
y_pred = model.predict(X_test)
"""

    issues = _analyze_source(tmp_path, source, TestOnTrainRule())

    assert len(issues) == 1
    assert issues[0].rule_id == "E001"
    assert issues[0].line_number == 2


def test_evaluation_rule_allows_test_data_scoring(tmp_path):
    source = """
test_acc = model.score(X_test, y_test)
y_pred = model.predict(X_test)
"""

    issues = _analyze_source(tmp_path, source, TestOnTrainRule())

    assert issues == []
