# StudySync Backend Documentation

StudySync (AI University Navigator) is a FastAPI-based backend that integrates AI-powered features like a conversational agent, automated Gmail scanning for important updates, and PDF-based Retrieval-Augmented Generation (RAG).

## 📁 Directory Structure

- `backend/`
    - [run.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/run.py): Server entry point.
    - [app/](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/services/scheduler_service.py#212-215)
        - [main.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/main.py): Application initialization and configuration.
        - [database.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/database.py): Database connection and session management.
        - [models.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/models.py): SQLAlchemy database models.
        - [agent/](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/api/endpoints/chat.py#26-40): AI Agent logic (orchestrator, tools, callbacks).
        - `api/`: REST API endpoints.
        - `core/`: Core security and configuration.
        - `schemas/`: Pydantic data validation models.
        - `services/`: External integrations and background tasks.

---

## 🚀 Core Application ([app/](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/services/scheduler_service.py#212-215))

### [main.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/main.py)
The central entry point for the FastAPI application.
- **[lifespan(app)](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/main.py#17-26)**: Async context manager that handles startup (creating DB tables, starting the scheduler) and shutdown.
- **[app](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/services/scheduler_service.py#212-215)**: The FastAPI instance, configured with CORS middleware and included routers for chat, user, updates, and files.

### [database.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/database.py)
Handles connection to the database (likely PostgreSQL/Supabase).
- **`engine`**: SQLAlchemy engine created from the `DATABASE_URL`.
- **`SessionLocal`**: Session factory for database transactions.
- **`Base`**: Declarative base class for models.

### [models.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/models.py)
Defines the database schema using SQLAlchemy.
- **[User](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/models.py#6-16)**: Stores user data, including email, name, and Google refresh tokens.
- **[ImportantUpdate](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/models.py#17-39)**: Stores results from the Gmail scanner, linked to a user.
- **[Feedback](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/models.py#41-52)**: Optional table for user feedback on AI-generated updates.

---

## 🤖 AI Agent Module (`app/agent/`)

The agent is built using LangChain and powered by Google's `gemini-2.5-flash`.

### [orchestrator.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/agent/orchestrator.py)
- **[create_agent_executor(access_token)](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/agent/orchestrator.py#76-117)**: Factory function that creates a LangChain agent. It dynamically adds [GmailReaderTool](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/agent/tools/gmail_reader_tool.py#15-83) and `CreateCalendarEventTool` if a valid Google access token is provided.
- **[get_agent_response(...)](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/agent/orchestrator.py#119-142)**: High-level async function that invokes the agent and returns its text output.

### 🛠️ Agent Tools (`app/agent/tools/`)
- **[advisor_tool.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/agent/tools/advisor_tool.py)**: Generates structured roadmaps for learning goals.
- **[gmail_reader_tool.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/agent/tools/gmail_reader_tool.py)**: Reads recent emails from the user's Gmail inbox.
- **[rag_tool.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/agent/tools/rag_tool.py)**: Queries a Vercel-hosted RAG server about uploaded PDF documents.
- **[calendar_tool.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/agent/tools/calendar_tool.py)**: Creates events on the user's Google Calendar.
- **[web_scraper_tool.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/agent/tools/web_scraper_tool.py)**: Extracts content from websites to answer user queries.
- **[contest_scanner_tool.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/agent/tools/contest_scanner_tool.py)**: Scans for upcoming competitive programming contests.

### [callbacks.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/agent/callbacks.py)
- **[StreamingCallbackHandler](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/agent/callbacks.py#9-34)**: An async callback that pushes agent activity (tool starts, tool results) to an `asyncio.Queue` for real-time streaming to the frontend via Server-Sent Events (SSE).

---

## 🌐 API Endpoints (`app/api/endpoints/`)

### [chat.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/api/endpoints/chat.py)
- **`POST /api/chat/stream`**: Initiates a streaming chat session with the AI agent. Secured via Google Auth.

### [user.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/api/endpoints/user.py)
- **`GET /api/users/me`**: Fetches the current user profile (creates it if it doesn't exist).
- **`POST /api/users/store_refresh_token`**: Securely stores a Google refresh token for background tasks.

### [files.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/api/endpoints/files.py)
- **`POST /api/files/upload`**: Handles PDF uploads. It splits the document into chunks, generates embeddings using Google's `embedding-001` model, and stores them in a Supabase vector store for future RAG queries.

---

## ⚙️ Background Services (`app/services/`)

### [scheduler_service.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/services/scheduler_service.py)
Managed by `APScheduler`, this service performs periodic tasks.
- **[run_email_summary_for_user(user_email)](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/services/scheduler_service.py#116-206)**: Background job that scans a user's Gmail, detects important updates (e.g., deadlines, events) using a Hugging Face-hosted classifier, and saves them to the DB.
- **[classify_emails_batch(email_texts)](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/services/scheduler_service.py#41-110)**: Calls the ML classifier API.

### [google_auth.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/services/google_auth.py)
- **[get_user_credentials(user_email)](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/services/google_auth.py#19-53)**: Retrieves and refreshes Google OAuth2 credentials using the stored refresh token, allowing background services to access Google APIs on behalf of the user.

---

## 🛡️ Security (`app/core/`)

### [security.py](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/core/security.py)
- **[get_current_user(token)](file:///c:/Users/Riaan/OneDrive/Desktop/studysync/backend/app/core/security.py#22-86)**: A FastAPI dependency that validates Google ID tokens or Access Tokens. It verifies the token's audience and integrity before allowing access to protected routes.
