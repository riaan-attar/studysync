import asyncio
import os
from dotenv import load_dotenv
from wasenderapi import create_async_wasender

# Load environment variables
load_dotenv()

async def test_wasender():
    api_key = os.getenv("WASENDER_API_KEY")
    # Replace with a real phone number including country code (e.g., "919876543210")
    to_phone = "+919423644203" 
    
    if not api_key or api_key == "your_wasender_api_key_here":
        print("❌ Error: WASENDER_API_KEY is not set correctly in .env")
        return

    if to_phone == "YOUR_PHONE_NUMBER_HERE":
        print("💡 Tip: Please replace 'YOUR_PHONE_NUMBER_HERE' in the script with a real phone number.")

    print(f"🚀 Sending test message to {to_phone}...")
    
    try:
        async_client = create_async_wasender(api_key=api_key)
        async with async_client:
            response = await async_client.send_text(
                to=to_phone,
                text_body="Hello, this is a test message from StudySync! 🚀"
            )
            print(f"✅ Success! Message sent.")
            print(f"Response: {response}")
    except Exception as e:
        print(f"❌ Failed to send message: {e}")

if __name__ == "__main__":
    asyncio.run(test_wasender())
