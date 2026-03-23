import asyncio
import traceback
from app.agent.orchestrator import create_agent_executor

async def main():
    agent_executor = create_agent_executor("fake_token")
    try:
        response = await agent_executor.ainvoke({
            "input": "show me some upcoming code force contests",
            "user_email": "test@example.com"
        })
        with open("error_log.txt", "w") as f:
            f.write(f"SUCCESS: {response}\n")
    except Exception as e:
        with open("error_log.txt", "w") as f:
            f.write("ERROR OCCURRED:\n")
            f.write(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(main())
