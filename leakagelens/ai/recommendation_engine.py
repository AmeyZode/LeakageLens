from typing import Dict
import json
import logging
import os
from leakagelens.rules.base_rule import Issue
from leakagelens.ai.prompt_templates import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE

logger = logging.getLogger(__name__)

FALLBACK_RECOMMENDATIONS = {
    "L001": {
        "explanation": "Scaling or data transformation is executed on the entire dataset prior to splitting. This causes information from the validation/test set to leak into the training process, leading to optimistic bias.",
        "fix": "# Perform train/test split first\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\n# Fit scaler only on train, transform both\nscaler = StandardScaler()\nX_train_scaled = scaler.fit_transform(X_train)\nX_test_scaled = scaler.transform(X_test)"
    },
    "L002": {
        "explanation": "Dataset overlap detected. Training and testing datasets are shared or overlap, which directly invalidates evaluation scores.",
        "fix": "# Ensure disjoint train and test splits\ntrain_df = df.sample(frac=0.8, random_state=42)\ntest_df = df.drop(train_df.index)"
    },
    "L003": {
        "explanation": "Random split used on temporal/time-series datasets. This causes lookahead bias because future data points are randomly put into the training set.",
        "fix": "# Use chronological/temporal splits\nsplit_index = int(len(df) * 0.8)\ntrain_df = df.iloc[:split_index]\ntest_df = df.iloc[split_index:]"
    },
    "L004": {
        "explanation": "Target variable is directly present in the feature matrix, creating direct target leakage.",
        "fix": "# Drop target column from features\nX = df.drop(columns=['target'])\ny = df['target']"
    },
    "R001": {
        "explanation": "Stochastic split or model initialization is missing a random state/seed. This prevents the training pipeline from being reproducible.",
        "fix": "# Add random_state or seed keyword parameter\nX_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)\nmodel = RandomForestClassifier(random_state=42)"
    },
    "R002": {
        "explanation": "No global seed initialization is found in the project. Global seeds ensure numpy, random, or deep learning libraries produce deterministic runs.",
        "fix": "import numpy as np\nimport random\n\nrandom.seed(42)\nnp.random.seed(42)"
    },
    "R003": {
        "explanation": "Hardcoded absolute path detected. This limits the execution of the code strictly to a single machine configuration.",
        "fix": "from pathlib import Path\n# Use relative paths or config directories\nDATA_DIR = Path(__file__).parent / 'data'\ndf = pd.read_csv(DATA_DIR / 'dataset.csv')"
    },
    "E001": {
        "explanation": "Model evaluation is run on the train dataset instead of a separate test dataset. This hides overfitting and doesn't represent true performance.",
        "fix": "# Evaluate on unseen test/validation data\ntest_acc = model.score(X_test, y_test)\nprint(f'Test accuracy: {test_acc}')"
    },
    "E002": {
        "explanation": "Missing validation split. The model is trained on the entire dataset with no split, which prevents performance evaluation.",
        "fix": "X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)\nmodel.fit(X_train, y_train)"
    },
    "E003": {
        "explanation": "Potential evaluation metric misuse. An evaluation metric (e.g. classification accuracy vs. regression MSE) is mismatched with the task/model type.",
        "fix": "# Use accuracy_score/f1_score for classification, MSE/R2 for regression\nfrom sklearn.metrics import accuracy_score\nprint(f'Accuracy: {accuracy_score(y_test, y_pred)}')"
    },
    "Q001": {
        "explanation": "Unused imports clutter the codebase and increase package overhead.",
        "fix": "# Remove the unused import statements from the top of the file."
    },
    "Q002": {
        "explanation": "Unused variables declared but never read.",
        "fix": "# Remove the unused variables to keep memory and code clean."
    },
    "Q003": {
        "explanation": "Function is too complex (too many arguments or too long).",
        "fix": "# Refactor/split the function into smaller modular functions."
    },
    "Q004": {
        "explanation": "Function is missing a docstring documentation.",
        "fix": "def my_function():\n    \"\"\"Add descriptive docstring here.\"\"\"\n    pass"
    }
}

class RecommendationEngine:
    """Interface to get descriptions, explanations, risks, and fixes from LLMs or Local templates."""
    def __init__(self, provider: str = "fallback", api_key: str = None, ollama_url: str = None):
        self.provider = provider
        self.api_key = api_key
        self.ollama_url = ollama_url

    def get_recommendation(self, issue: Issue, code_context: str) -> Dict[str, str]:
        """Query LLM (OpenAI/Ollama) or return template-based fallback recommendation."""
        fallback = FALLBACK_RECOMMENDATIONS.get(
            issue.rule_id, 
            {"explanation": "No static recommendation available.", "fix": "# Verify code structure manually"}
        )
        
        if self.provider == "groq" and (self.api_key or os.getenv("GROQ_API_KEY")):
            try:
                from openai import OpenAI
                api_key = self.api_key or os.getenv("GROQ_API_KEY")
                client = OpenAI(
                    api_key=api_key,
                    base_url="https://api.groq.com/openai/v1"
                )
                
                prompt = USER_PROMPT_TEMPLATE.format(
                    file_path=issue.file_path,
                    line_number=issue.line_number,
                    rule_name=issue.rule_name,
                    severity=issue.severity,
                    description=issue.description,
                    code_context=code_context
                )
                
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                
                data = json.loads(response.choices[0].message.content)
                return {
                    "explanation": data.get("explanation", fallback["explanation"]),
                    "fix": data.get("fix", fallback["fix"])
                }
            except Exception as e:
                logger.error(f"Groq recommendation failed: {e}. Falling back.")
                return fallback

        if self.provider == "openai" and self.api_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                
                prompt = USER_PROMPT_TEMPLATE.format(
                    file_path=issue.file_path,
                    line_number=issue.line_number,
                    rule_name=issue.rule_name,
                    severity=issue.severity,
                    description=issue.description,
                    code_context=code_context
                )
                
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                
                data = json.loads(response.choices[0].message.content)
                return {
                    "explanation": data.get("explanation", fallback["explanation"]),
                    "fix": data.get("fix", fallback["fix"])
                }
            except Exception as e:
                logger.error(f"OpenAI recommendation failed: {e}. Falling back.")
                return fallback
                
        return fallback
