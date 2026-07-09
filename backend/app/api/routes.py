from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
import uuid
import time
from app.graph.workflow import execute_graph
from app.services.firestore_service import firestore_service
from app.services.parser_service import parser_service
from app.services.event_bus import event_bus
from app.services.task_runner import task_runner
from app.services.ocr_service import ocr_service
from app.services.document_parser import document_parser

router = APIRouter()

class AnalyzeRequest(BaseModel):
    case_id: str
    document_urls: list[str] = []

@router.post("/cases/create")
async def create_case(
    file: UploadFile = File(...),
    lawyer_id: str = Form(None)
):
    try:
        # 1. Read file
        file_bytes = await file.read()
        
        # OCR has been intentionally removed for FIRs due to poor handwriting accuracy.
        # The lawyer will manually fill in the form. We return an empty extracted_data dict.
        
        return {
            "status": "success",
            "extracted_data": {}
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unable to confidently extract. Please fill manually.")

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    uploaded_by: str = Form(...)
):
    try:
        file_bytes = await file.read()
        
        ocr_text = ocr_service.process_file(file_bytes, file.filename)
        
        classification = await document_parser.classify_document(ocr_text)
        
        doc_data = {
            "caseId": case_id,
            "uploadedBy": uploaded_by,
            "ocrText": ocr_text,
            "documentType": classification.documentType,
            "summary": classification.summary,
            "verified": False,
            "approvedBy": None
        }
        
        doc_id = await firestore_service.save_document(doc_data)
        
        # In a real app we'd trigger a notification here to the assigned lawyer
        
        return {
            "status": "success",
            "document_id": doc_id,
            "classification": classification.model_dump()
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Document processing failed.")

async def process_case_background(case_id: str, document_urls: list[str]):
    # 1. Load Case from Firestore
    case_data = await firestore_service.get_case(case_id)
    if not case_data:
        print(f"[ERROR] Case {case_id} not found.")
        return

    # 2. Publish Event
    event_bus.publish("CaseAnalysisStarted", {"case_id": case_id})

    # 3. Load & Parse Documents
    parsed_docs = []
    for url in document_urls:
        text = await parser_service.extract_text(url)
        parsed_docs.append({"url": url, "text": text})

    # 4. Prepare Initial State
    run_id = f"run_{uuid.uuid4().hex[:8]}"
    initial_state = {
        "run_id": run_id,
        "case_id": case_id,
        "case_data": case_data,
        "documents": parsed_docs,
        "normalized_case": {},
        "errors": []
    }

    # 5. Execute LangGraph Workflow
    final_state = await execute_graph(initial_state)

    # 6. Store Results
    await firestore_service.save_graph_run(run_id, final_state)
    
    # Save the final report attached directly to the case
    # Also save the full transcript for the frontend Courtroom replay
    report_data = {
        "final_report": final_state.get("final_report", {}),
        "merged_data": final_state.get("merged_data", {}),
        "transcript": final_state.get("transcript", []),
        "telemetry": final_state.get("telemetry", {}),
        "execution_time": final_state.get("execution_time", 0)
    }
    await firestore_service.save_agent_report(case_id, report_data)
    
    # Update the parent case document
    await firestore_service.update_case_analysis_status(case_id, "Resolved")

    # 7. Publish Completion Event
    event_bus.publish("CaseAnalysisCompleted", {"case_id": case_id, "run_id": run_id})

@router.post("/analyze-case")
async def analyze_case(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    task_runner.enqueue(
        background_tasks, 
        process_case_background, 
        request.case_id, 
        request.document_urls
    )
    return {"status": "Accepted", "message": f"Analysis started for case {request.case_id}"}

@router.get("/health")
async def health_check():
    from app.services.llm_service import llm_service
    
    res = {
        "backend": "healthy",
        "firestore": "connected" if firestore_service.db else "disconnected",
        "langgraph": "ready"
    }
    
    import time
    for provider in llm_service.providers:
        status = "offline"
        if time.time() >= getattr(provider, "unhealthy_until", 0):
            status = "connected"
        else:
            status = "cooldown"
            
        res[provider.name.lower()] = {
            "status": status,
            "model": getattr(provider, "model_name", "unknown")
        }
    
    return res

class TestGeminiRequest(BaseModel):
    prompt: str

class TestGeminiResponse(BaseModel):
    status: str
    result: dict

@router.post("/test-gemini")
async def test_gemini(request: TestGeminiRequest):
    from app.services.llm_service import llm_service
    try:
        from app.schemas.agent_schemas import AgentThinkingResult
        response = await llm_service.generate_with_fallback(prompt=request.prompt, schema=AgentThinkingResult)
        return {"status": "success", "result": response["result"].model_dump(), "provider": response["provider_used"]}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/debug/{case_id}")
async def debug_case(case_id: str):
    if not firestore_service.db:
        raise HTTPException(status_code=500, detail="Firestore not connected")
        
    runs = firestore_service.db.collection('graph_runs').where('case_id', '==', case_id).stream()
    runs_list = [r.to_dict() for r in runs]
    
    if not runs_list:
        raise HTTPException(status_code=404, detail=f"No graph runs found for {case_id}")
        
    latest_run = sorted(runs_list, key=lambda x: x.get('started_at', ''), reverse=True)[0]
    
    return {
        "run_id": latest_run.get("run_id"),
        "status": latest_run.get("status"),
        "execution_time": latest_run.get("execution_time"),
        "errors": latest_run.get("errors", []),
        "timeline": latest_run.get("timeline", []),
        "transcript": latest_run.get("transcript", [])
    }

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatContext(BaseModel):
    user_role: str
    current_page: str
    case_id: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: ChatContext

@router.post("/chat")
async def chat_with_assistant(request: ChatRequest):
    from app.services.llm_service import llm_service
    try:
        # Build System Prompt
        system_prompt = (
            "You are the JusticeGrid Legal Assistant, a helpful AI guide built into the JusticeGrid platform. "
            "JusticeGrid is a legal tech platform that accelerates bail processes for undertrials using multi-agent AI. "
            f"You are currently speaking to a user with the role: {request.context.user_role.upper()}. "
            f"They are currently on the page: {request.context.current_page}. "
            "Your scope is to explain JusticeGrid features, explain AI outputs (like Eligibility or Strategy agent reasoning), "
            "explain legal terminology simply, and guide users through the platform. "
            "NEVER provide official legal advice or claim to replace a lawyer. Keep answers concise, clear, and empathetic.\n\n"
        )
        
        # Add context if a case is open
        if request.context.case_id:
            case_data = await firestore_service.get_case(request.context.case_id)
            if case_data:
                system_prompt += f"CONTEXT - The user is currently viewing Case ID: {request.context.case_id}.\n"
                system_prompt += f"Undertrial Name: {case_data.get('undertrialName', 'Unknown')}\n"
                system_prompt += f"Charges: {case_data.get('charges', 'Unknown')}\n"
                system_prompt += f"Next Hearing: {case_data.get('nextHearing', 'Unknown')}\n"
                
                # Fetch AI analysis if available
                if case_data.get('analysisCompleted'):
                    from google.cloud import firestore
                    doc_ref = firestore_service.db.collection('case_analyses').document(request.context.case_id)
                    doc_snap = doc_ref.get()
                    if doc_snap.exists:
                        analysis = doc_snap.to_dict()
                        if analysis.get('final_report'):
                            system_prompt += f"AI Final Verdict: {analysis['final_report'].get('result', {}).get('recommendation', '')}\n"
                            system_prompt += f"AI Reasoning: {analysis['final_report'].get('result', {}).get('reasoning', '')}\n"
        
        # Format messages for the LLM
        # For simplicity, we just format the history into a block of text, 
        # then append the final user message to be answered.
        history_text = ""
        for msg in request.messages[:-1]:
            prefix = "User" if msg.role == "user" else "Assistant"
            history_text += f"{prefix}: {msg.content}\n"
            
        current_question = request.messages[-1].content
        
        final_prompt = f"{system_prompt}\n"
        if history_text:
            final_prompt += f"--- Chat History ---\n{history_text}\n"
        final_prompt += f"--- Current Question ---\nUser: {current_question}\nAssistant:"
        
        # Generate response
        response = await llm_service.generate_with_fallback(prompt=final_prompt)
        
        return {"status": "success", "reply": response["result"]}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to generate AI response.")
