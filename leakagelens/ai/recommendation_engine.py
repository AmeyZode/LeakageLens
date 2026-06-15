from typing import Dict
from leakagelens.rules.base_rule import Issue

class RecommendationEngine:
    """Interface to get descriptions, explanations, risks, and fixes from LLMs or Local templates."""
    def __init__(self, provider: str = "fallback", api_key: str = None, ollama_url: str = None):
        pass

    def get_recommendation(self, issue: Issue, code_context: str) -> Dict[str, str]:
        """Query LLM (OpenAI/Ollama) or return template-based fallback recommendation."""
        pass
