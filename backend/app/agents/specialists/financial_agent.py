from app.schemas.agent_schemas import AgentThinkingResult, AgentReport
from app.schemas.agent_metadata import AgentMetadata
import time
from datetime import datetime
from app.services.event_bus import event_bus

async def run_financial_agent(state: dict) -> dict:
    agent_name = "Financial Agent"
    print(f"[START] {agent_name} Started")
    start_time = time.time()
    start_dt = datetime.now()
    
    # Deterministic logic
    case_data = state.get("normalized_case", {})
    charges = str(case_data.get("charges", "")).lower()
    
    surety_amount = 50000
    if "murder" in charges or "302" in charges:
        surety_amount = 100000
    elif "theft" in charges:
        surety_amount = 10000
        
    finding = f"Calculated baseline surety amount at ₹{surety_amount}."
    reasoning = f"Based on the severity of charges ({charges}), the standard procedural surety is ₹{surety_amount}."
    recommendation = "Require standard local surety or personal bond if indigent."
    
    result_obj = AgentThinkingResult(
        finding=finding,
        reasoning=reasoning,
        legal_references="Standard Procedural Guidelines",
        recommendation=recommendation,
        confidence=100
    )
    
    duration = round(time.time() - start_time, 2)
    print(f"[SUCCESS] {agent_name} Completed ({duration}s)")
    
    report = AgentReport(
        result=result_obj,
        metadata=AgentMetadata(
            agent_name=agent_name,
            execution_time=duration,
            status="completed",
            confidence=100.0,
            provider_used="Deterministic",
            retries_attempted=0,
            fallback_triggered=False,
            prompt_tokens=0,
            completion_tokens=0
        )
    )
    
    timeline = state.get("timeline", [])
    timeline.append({
        "agent": agent_name,
        "started": str(start_dt),
        "completed": str(datetime.now()),
        "duration": duration
    })
    
    transcript = state.get("transcript", [])
    msg = {
        "speaker": agent_name,
        "type": "analysis",
        "message": result_obj.reasoning,
        "finding": result_obj.finding,
        "recommendation": result_obj.recommendation,
        "legal_references": result_obj.legal_references,
        "animation": "speaking",
        "confidence": result_obj.confidence,
        "provider": "Deterministic",
        "timestamp": str(datetime.now()),
        "duration": duration,
        "status": "completed"
    }
    transcript.append(msg)
    
    event_bus.publish(f"AgentCompleted", msg)
    
    return {"financial": report.model_dump(), "timeline": timeline, "transcript": transcript}
