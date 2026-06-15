from leakagelens.core.context_builder import PipelineContext, build_context

def test_context_builder_imports():
    assert PipelineContext is not None
    assert build_context is not None
