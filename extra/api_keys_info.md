# Required API Keys for StudySync

To get your backend running, you need these four keys. You can skip `GROQ_API_KEY` for now as it's not strictly required by the current code.

### 1. `GOOGLE_API_KEY` (High Priority)
*   **Where to find**: [Google AI Studio](https://aistudio.google.com/app/apikey)
*   **Purpose**: This powers the AI features (Gemini 2.5 Flash). It's used for the Chat, Advisor, and Event Parsing tools.

---

### 2. `DATABASE_URL` (High Priority)
*   **Where to find**: **Supabase Dashboard**
    1.  Go to [Supabase](https://supabase.com/).
    2.  Open your project -> **Project Settings** -> **Database**.
    3.  Copy the **URI** connection string.
    4.  It looks like: `postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`
*   **Remember**: Replace `[PASSWORD]` with your database password!

---

### 3. `GOOGLE_AUDIENCE_CLIENT_ID` (High Priority)
*   **Where to find**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
    1.  Go to **APIs & Services** -> **Credentials**.
    2.  Copy the **Client ID** under "OAuth 2.0 Client IDs".
*   **Purpose**: This lets the backend verify your identity when you log in.

---

### 4. `CLIST_API_KEY` (Medium Priority)
*   **Where to find**: [CList.by API](https://clist.by/api/v4/doc/)
    1.  Sign up on [clist.by](https://clist.by/).
    2.  Your API key is available in your profile settings.
*   **Purpose**: This allows the "Contest Scanner" to find upcoming LeetCode and Codeforces contests.
