import asyncio
import websockets
import json
import time
import requests

async def test_websocket():
    case_id = "CASE-2026-0001"
    
    # Enable mock mode dynamically for this test
    requests.get("http://127.0.0.1:8000/api/v1/health") # Ensure server is up
    
    print("Connecting to websocket...")
    try:
        async with websockets.connect(f"ws://127.0.0.1:8000/api/v1/ws/{case_id}") as ws:
            print("Connected! Triggering analyze-case via HTTP...")
            
            res = requests.post("http://127.0.0.1:8000/api/v1/analyze-case", json={
                "case_id": case_id,
                "document_urls": []
            })
            print(f"HTTP Response: {res.json()}")
            
            print("Listening for websocket events...")
            # We expect a few events: CaseAnalysisStarted, AgentCompleted for Intake, Eligibility, Delay, Financial, Strategy, Merge, Third Opinion, Final Report
            for i in range(10):
                msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
                event = json.loads(msg)
                print(f"Received Event: {event['type']}")
                if event['type'] == 'AgentCompleted':
                    data = event['data']
                    print(f"  -> {data['speaker']} spoke: '{data['message'][:30]}...'")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
