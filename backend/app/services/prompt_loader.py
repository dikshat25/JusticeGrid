import os
from pathlib import Path

class PromptLoader:
    def __init__(self, prompts_dir: str = "app/prompts"):
        self.prompts_dir = Path(prompts_dir)

    def load(self, prompt_name: str) -> str:
        prompt_path = self.prompts_dir / f"{prompt_name}.txt"
        if not prompt_path.exists():
            raise FileNotFoundError(f"Prompt template {prompt_name}.txt not found.")
        return prompt_path.read_text(encoding="utf-8")

    def verify_all_prompts_exist(self):
        required_prompts = [
            "eligibility", "delay", "financial", 
            "strategy", "third_opinion", "final_report"
        ]
        missing = []
        for p in required_prompts:
            if not (self.prompts_dir / f"{p}.txt").exists():
                missing.append(p)
        if missing:
            raise FileNotFoundError(f"Missing required prompt files: {', '.join(missing)}")

prompt_loader = PromptLoader()
