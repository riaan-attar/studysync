import asyncio
import torch
from app.agent.orchestrator import get_agent_response

async def main():
    print("Testing agent response...")
    response = await get_agent_response(
        user_input="Hello",
        user_email="test@example.com",
        access_token="fake_token"
    )
    print("Response:", response)

if __name__ == "__main__":
    asyncio.run(main())
