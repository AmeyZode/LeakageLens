from leakagelens.rules.base_rule import BaseRule, Issue
from leakagelens.rules.leakage_rules import (
    PreprocessingLeakageRule,
    OverlapLeakageRule,
    TemporalLeakageRule,
    FeatureLeakageRule
)
from leakagelens.rules.reproducibility_rules import (
    RandomStateRule,
    GlobalSeedRule,
    HardcodedPathsRule
)
from leakagelens.rules.evaluation_rules import (
    TestOnTrainRule,
    MissingValidationRule,
    MetricMisuseRule
)
from leakagelens.rules.quality_rules import (
    UnusedImportsRule,
    UnusedVariablesRule,
    ComplexityRule,
    DocumentationRule
)

ALL_RULES = [
    # Leakage
    PreprocessingLeakageRule(),
    OverlapLeakageRule(),
    TemporalLeakageRule(),
    FeatureLeakageRule(),
    
    # Reproducibility
    RandomStateRule(),
    GlobalSeedRule(),
    HardcodedPathsRule(),
    
    # Evaluation
    TestOnTrainRule(),
    MissingValidationRule(),
    MetricMisuseRule(),
    
    # Quality
    UnusedImportsRule(),
    UnusedVariablesRule(),
    ComplexityRule(),
    DocumentationRule(),
]
