import asyncio
from app.agents.specialists.eligibility_agent import run_eligibility_agent
from dotenv import load_dotenv

load_dotenv()

async def main():
    state = {
        "normalized_case": {
            "FIRNumber": "123",
            "charges": "Sec 302 IPC",
            "detentionStartDate": "2023-01-01",
            "maximumPunishment": "Life"
        },
        "timeline": [],
        "transcript": []
    }
    print("Testing Eligibility Agent directly...")
    result = await run_eligibility_agent(state)
    print("Result:")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
