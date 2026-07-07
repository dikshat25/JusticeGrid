import os

files = [
    "app/agents/core/intake_agent.py",
    "app/agents/specialists/eligibility_agent.py",
    "app/agents/specialists/delay_agent.py",
    "app/agents/specialists/financial_agent.py",
    "app/agents/specialists/strategy_agent.py",
    "app/agents/review/merge_node.py",
    "app/agents/review/third_opinion_agent.py",
    "app/agents/review/final_report_agent.py"
]

for f in files:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    content = content.replace("▶", "[START]")
    content = content.replace("✔", "[SUCCESS]")
    content = content.replace("✖", "[FAILED]")
    with open(f, "w", encoding="utf-8") as file:
        file.write(content)
print("Replaced symbols in all agent files.")
