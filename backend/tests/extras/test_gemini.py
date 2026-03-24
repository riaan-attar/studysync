import os
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env file
load_dotenv()

# Get the API key from environment
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    # Fallback/Error if not found
    print("Error: GOOGLE_API_KEY not found in .env file.")
else:
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        # model="gemma-3-27b-it",
        # model="gemini-3.1-flash-lite-preview",
        # model="gemini-2.5-flash-native-audio-preview-12-2025",
        model = os.getenv("GOOGLE_AI_MODEL", "gemma-3-27b-it"),
        contents="which model is this",
    )

    print(response.text)
