from leakagelens.rules import ALL_RULES, BaseRule

def test_rules_imports():
    assert ALL_RULES is not None
    assert BaseRule is not None
