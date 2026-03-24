# StudySync - Project Documentation

## 1. Overview
StudySync (also internally referred to as `study-scan`) is an intelligent, AI-powered university navigator and productivity assistant designed for students. The platform centralizes and automates student workflows by integrating an advanced AI assistant with real-world integrations such as Google Calendar, Gmail, and custom document (PDF) analysis.

Whether it's finding competitive programming contests, scheduling events from emails, parsing PDFs for deadlines, or generating a personalized strategic roadmap, StudySync leverages large language models (LLMs) to seamlessly handle these tasks.

---

## 2. Key Features

### 2.1. Conversational AI Agent (Orchestrator)
- **Description:** A highly capable AI agent built with LangChain and Google's `gemini` model. It acts as an autonomous university navigator.
- **Workflows Supported:**
  - **General Q&A:** Answering questions based on Web scraping, Gmail reading, or PDF documents.
  - **Smart Scheduling:** Automatically parsing event details from URLs, emails, or PDFs, and seamlessly adding them to the user's Google Calendar.
  - **Contest Scanning:** Fetching upcoming competitive programming contests from LeetCode and Codeforces and scheduling them.
  - **Strategic Advising:** Generating structured JSON roadmaps for students based on their goals (e.g., "how to prepare for software engineering interviews").

### 2.2. Automated Email Scanning & Classification
- **Description:** A background service that periodically scans the user's Gmail inbox for new emails and classifies them to highlight important updates.
- **Functionality:** 
  - Retrieves unread emails using the `GmailJsonTool`.
  - Classifies emails directly using a dedicated HuggingFace Inference Endpoint API.
  - Supported Labels: `CAREER`, `EVENT`, `DEADLINE`, `GENERAL`, `SPAM/PROMO`.
  - Automatically filters out spam and highlights important events in the "Updates" dashboard view.
  - **Active Learning:** Users can mark if the classification was correct or incorrect. Incorrectly classified emails are hidden from the UI, and the feedback fuels future model improvements.

### 2.3. Document Analysis & RAG (Retrieval-Augmented Generation)
- **Description:** Users can upload PDF documents (e.g., syllabi, assignments) which the agent can retrieve information from.
- **Functionality:** Implemented using `DocumentQueryTool` and integrated PDF parsing libraries on both frontend and backend. 

### 2.4. Comprehensive User Profiles
- **Description:** A highly visual user profile dashboard.
- **Functionality:** Allows users to manage personal information (Phone Number, Address, Bio, Date of Birth, Profile Image/Avatar) alongside their linked external accounts (Google OAuth).

### 2.5. Modern Frontend Dashboard
- **Description:** A beautifully designed frontend tailored to provide an immersive student experience.
- **Functionality:** Uses a dark glassmorphic theme with ambient glow micro-animations. It encompasses views for Chat, Updates (Newsfeed from classified emails), Advisor (Roadmaps), and Profile.

---

## 3. Technology Stack

### 3.1. Frontend
- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript
- **Styling & UI:** Tailwind CSS 4, Framer Motion (Animations), Radix UI (Primitives)
- **AI & Integrations:** LangChain Community / Core, HuggingFace Inference JS, Supabase JS Client (Authentication/DB operations)
- **Utilities:** PDF-Lib & pdfjs-dist for document rendering

### 3.2. Backend
- **Framework:** Python 3, FastAPI
- **Database ORM:** SQLAlchemy (connected to a Supabase PostgreSQL instance)
- **AI & Orchestration:** LangChain (Tools, Agents, RAG), `langchain-google-genai`
- **Models Used:** Google `gemma-3-27b-it` (via LangChain orchestrator) and custom HuggingFace text classifier endpoint.
- **Integrations:** Google API Python Client (Gmail v1, Calendar v3)
- **Background Jobs:** APScheduler (`AsyncIOScheduler`) for interval-based async email scanning.

---

## 4. Architecture & Data Flow

1. **Authentication:** User logs in via the Frontend (NextAuth/Supabase). Access/refresh tokens for Google APIs are securely saved to the Database via FastAPI routes.
2. **AI Chat Request:** User sends a query through `ChatSection.tsx`.
3. **Agent Orchestration:** FastAPI endpoint (`chat.py`) relays the query to the LangChain `AgentExecutor` in `orchestrator.py`.
4. **Tool Execution:** The LLM decides which tools to invoke depending on the context:
   - For scheduling: Calls `WebScraperTool`, `EventParserTool`, then `CreateCalendarEventTool`.
   - For email insight: Calls `GmailReaderTool`.
5. **Background Sync:** Independent of the chat, `scheduler_service.py` runs periodically, invoking the HuggingFace endpoint to classify incoming emails and populate the `ImportantUpdate` table in the database.
6. **Dashboard Real-time:** The `UpdatesView.tsx` polls or fetches from the `/updates` API to render neatly categorized tiles for university news, deadlines, and events.

---

## 5. Development & Deployment

### Run Local Backend
1. Navigate to `/backend`.
2. Configure `.env` with `DATABASE_URL`, `GOOGLE_API_KEY`, etc.
3. Activate virtual environment and install dependencies: `pip install -r requirements.txt`.
4. Start FastAPI server: `uvicorn app.main:app --reload` (or through `run.py`).

### Run Local Frontend
1. Navigate to `/frontend`.
2. Configure `.env.local` with Supabase credentials and backend API URLs.
3. Install dependencies: `npm install`.
4. Start Next.js server: `npm run dev`.

---
*Generated automatically by AI Assistant based on repository exploration.*
