import asyncio
from app.graph.workflow import execute_graph
import traceback

async def main():
    try:
        initial_state = {
            "run_id": "test_run",
            "case_id": "CASE-123",
            "case_data": {"test": "data"},
            "documents": [],
            "normalized_case": {},
            "errors": []
        }
        print("Executing graph...")
        result = await execute_graph(initial_state)
        print("Result:", result)
    except Exception as e:
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
