import asyncio
from app.graph.workflow import execute_graph
from app.config.settings import settings

async def main():
    
    initial_state = {
        "run_id": "test_run",
        "case_id": "CASE-123",
        "case_data": {
            "FIRNumber": "123",
            "charges": "theft",
            "detentionStartDate": "2023-01-01"
        },
        "documents": [],
        "normalized_case": {},
        "errors": []
    }
    
    final_state = await execute_graph(initial_state)
    
    print("=== TIMELINE ===")
    for entry in final_state["timeline"]:
        print(f"{entry['agent']}: {entry['duration']}s")
        
    print("\n=== TRANSCRIPT ===")
    for entry in final_state["transcript"]:
        msg = f"{entry['speaker']}: {entry['finding']}"
        print(msg.encode('utf-8', 'replace').decode('utf-8'))

if __name__ == "__main__":
    asyncio.run(main())
