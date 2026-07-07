from app.graph.builder import build_graph
import time
from datetime import datetime

graph = build_graph().compile()

async def execute_graph(initial_state: dict) -> dict:
    start_time = time.time()
    
    initial_state["started_at"] = str(datetime.utcnow())
    initial_state["status"] = "RUNNING"
    initial_state["errors"] = []
    initial_state["timeline"] = []
    initial_state["transcript"] = []

    try:
        final_state = await graph.ainvoke(initial_state)
        
        # Calculate run telemetry
        total_latency = sum(t.get("duration", 0) for t in final_state.get("timeline", []))
        
        # Calculate tokens from transcript or state if available
        # Currently, transcript only has duration/confidence. We'll aggregate what we can.
        # Wait, the tokens are stored in the agent report (Firestore), not directly in transcript.
        # I will extract provider switches from the transcript
        transcript = final_state.get("transcript", [])
        provider_switches = 0
        last_provider = None
        fallback_reason = "None"
        
        for msg in transcript:
            provider = msg.get("provider")
            if provider and provider != "Deterministic" and provider != "unknown":
                if last_provider and provider != last_provider:
                    provider_switches += 1
                last_provider = provider
        
        final_state["telemetry"] = {
            "total_latency": round(total_latency, 2),
            "provider_switches": provider_switches,
            "final_provider": last_provider or "unknown",
            "fallback_reason": fallback_reason
        }
        
        final_state["status"] = "COMPLETED"
        final_state["completed_at"] = str(datetime.utcnow())
        final_state["execution_time"] = round(time.time() - start_time, 2)
        return final_state
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        initial_state["status"] = "FAILED"
        initial_state["completed_at"] = str(datetime.utcnow())
        initial_state["execution_time"] = round(time.time() - start_time, 2)
        initial_state["errors"].append(str(e))
        return initial_state
