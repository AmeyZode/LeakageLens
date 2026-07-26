SYSTEM_PROMPT = (
    "You are an AI-powered static analysis assistant for LeakageLens. "
    "Your goal is to analyze data leakage, reproducibility issues, and ML anti-patterns. "
    "Explain the issues found in the code, their risks, and provide a clear suggested code fix."
)

USER_PROMPT_TEMPLATE = (
    "File path: {file_path}\n"
    "Line number: {line_number}\n"
    "Detected Issue: {rule_name} ({severity})\n"
    "Description: {description}\n"
    "Code context:\n"
    "```python\n"
    "{code_context}\n"
    "```\n\n"
    "Please explain the risks of this issue and suggest a code snippet that fixes it. "
    "Format your response as a JSON object with 'explanation' and 'fix' keys."
)
