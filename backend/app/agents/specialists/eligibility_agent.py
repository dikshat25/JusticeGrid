from app.schemas.agent_schemas import AgentThinkingResult, AgentReport
from app.schemas.agent_metadata import AgentMetadata
from app.services.llm_service import llm_service
from app.services.prompt_loader import prompt_loader
import time
from datetime import datetime
import traceback
from app.services.event_bus import event_bus

async def run_eligibility_agent(state: dict) -> dict:
    """
    Determines bail eligibility using LLM fallback orchestration.
    """
    agent_name = "Eligibility Agent"
    print(f"[START] {agent_name} Started")
    start_time = time.time()
    start_dt = datetime.now()
    
    case_data = state.get("normalized_case", {})
    
    from app.services.legal_calculator import calculate_eligibility
    computed_facts = calculate_eligibility(case_data)
    
    prompt_template = prompt_loader.load("eligibility")
    formatted_prompt = prompt_template.format(
        case_data=str(case_data),
        days_in_custody=computed_facts["days_in_custody"],
        maximum_sentence_days=computed_facts["maximum_sentence_days"],
        threshold_days=computed_facts["threshold_days"],
        eligible=computed_facts["eligible"],
        reason=computed_facts["reason"]
    )
    
    provider_used = None
    retries = 0
    fallback = False
    
    try:
        response = await llm_service.generate_with_fallback(
            prompt=formatted_prompt, 
            schema=AgentThinkingResult
        )
        result_obj = response["result"]
        provider_used = response["provider_used"]
        model_used = response.get("model_used", "unknown")
        retries = response["retries_attempted"]
        fallback = response["fallback_triggered"]
        prompt_tokens = response.get("prompt_tokens", 0)
        completion_tokens = response.get("completion_tokens", 0)
        
        if result_obj is None:
            raise ValueError(f"{agent_name} returned None instead of AgentThinkingResult.")
            
        status = "completed"
        error_msg = None
    except Exception as e:
        print(f"[FAILED] {agent_name} Failed")
        traceback.print_exc()
        # Graceful failure: return empty result so the courtroom continues
        status = "failed"
        error_msg = str(e)
        result_obj = AgentThinkingResult(
            finding="Analysis Failed",
            reasoning=f"System error: {error_msg}",
            legal_references="N/A",
            recommendation="Defer to Judge.",
            confidence=0
        )
        prompt_tokens = 0
        completion_tokens = 0
        model_used = "error"
        
    duration = round(time.time() - start_time, 2)
    if status == "completed":
        print(f"[SUCCESS] {agent_name}\nProvider: {provider_used}\nModel: {model_used}\nLatency: {duration}s")
    
    report = AgentReport(
        result=result_obj,
        metadata=AgentMetadata(
            agent_name=agent_name,
            execution_time=duration,
            status=status,
            error_message=error_msg,
            confidence=100.0,
            provider_used=provider_used,
            model_used=model_used,
            retries_attempted=retries,
            fallback_triggered=fallback,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens
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
        "animation": "speaking" if status == "completed" else "error",
        "confidence": 100,
        "provider": provider_used,
        "timestamp": str(datetime.now()),
        "duration": duration,
        "status": status
    }
    transcript.append(msg)
    
    event_bus.publish(f"AgentCompleted", msg)
    
    return {
        "eligibility": report.model_dump(),
        "timeline": timeline,
        "transcript": transcript
    }
