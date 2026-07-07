import time
from datetime import datetime

async def run_merge_node(state: dict) -> dict:
    agent_name = "Merge Node"
    print(f"[START] {agent_name} Started")
    start_time = time.time()
    
    merged_data = {
        "eligibility": state.get("eligibility"),
        "delay": state.get("delay"),
        "financial": state.get("financial"),
        "strategy": state.get("strategy")
    }
    
    duration = round(time.time() - start_time, 2)
    print(f"[SUCCESS] {agent_name} Completed ({duration}s)")
    
    timeline = state.get("timeline", [])
    timeline.append({
        "agent": agent_name,
        "started": str(datetime.fromtimestamp(start_time)),
        "completed": str(datetime.now()),
        "duration": duration
    })
    
    return {"merged_data": merged_data, "timeline": timeline}
