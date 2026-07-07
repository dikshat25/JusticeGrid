from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import asyncio
from app.services.event_bus import event_bus

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, case_id: str):
        await websocket.accept()
        if case_id not in self.active_connections:
            self.active_connections[case_id] = []
        self.active_connections[case_id].append(websocket)

    def disconnect(self, websocket: WebSocket, case_id: str):
        if case_id in self.active_connections:
            self.active_connections[case_id].remove(websocket)
            if not self.active_connections[case_id]:
                del self.active_connections[case_id]

    async def broadcast_to_case(self, case_id: str, message: dict):
        if case_id in self.active_connections:
            for connection in self.active_connections[case_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending message to websocket: {e}")

manager = ConnectionManager()

@router.websocket("/ws/{case_id}")
async def websocket_endpoint(websocket: WebSocket, case_id: str):
    await manager.connect(websocket, case_id)
    try:
        # Keep the connection open
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, case_id)

def notify_websocket(event_type: str, data: dict):
    case_id = data.get("case_id")
    if not case_id:
        # If no case_id is found, broadcast to all cases (for testing)
        if manager.active_connections:
            case_id = list(manager.active_connections.keys())[0]
        else:
            return
            
    # Run broadcast safely in the event loop without awaiting it directly
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(manager.broadcast_to_case(case_id, {
            "type": event_type,
            "data": data
        }))
    except RuntimeError:
        pass # No event loop running

# Subscribe the websocket manager to the event bus
event_bus.subscribe("CaseAnalysisStarted", notify_websocket)
event_bus.subscribe("AgentCompleted", notify_websocket)
event_bus.subscribe("CaseAnalysisCompleted", notify_websocket)
