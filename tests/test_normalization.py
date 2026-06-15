from leakagelens.core.normalization import NormalizedFile, normalize_file

def test_normalization_imports():
    assert NormalizedFile is not None
    assert normalize_file is not None
