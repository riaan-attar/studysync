import asyncio
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

async def main():
    print("Testing LLM API directly...")
    llm = ChatGoogleGenerativeAI(
        model=os.getenv("GOOGLE_AI_MODEL", "gemini-3.1-flash-lite-preview"),
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0
    )
    print("Sending ping...")
    try:
        res = await asyncio.wait_for(llm.ainvoke("Hello"), timeout=15.0)
        print("Response:", res.content)
    except Exception as e:
        print("Error or timeout:", e)

if __name__ == "__main__":
    asyncio.run(main())
