# StudySync: AI University Navigator - Codebase Analysis

StudySync is a comprehensive AI-powered platform designed to help university students manage their academic life. It integrates an intelligent assistant with automated productivity tools like email classification and calendar scheduling.

---

## 🏗️ Core Architecture

The project follows a decoupled **Client-Server** architecture:

- **Backend**: A FastAPI-based REST API that orchestration AI agents and background workers.
- **Frontend**: A Next.js (React) web application providing a modern, dashboard-style interface.
- **AI Integration**: Combines LangChain for the chatbot agent and a dedicated HuggingFace-hosted model for email classification.

---

## 🖥️ Backend Deep Dive (`/backend`)

The backend is built with **FastAPI** and focus on three main pillars: AI Orchestration, Background Automation, and Data Persistence.

### 1. AI Assistant (Orchestrator)
The brain of the system resides in `app/agent/orchestrator.py`.
- **Engine**: Uses Google Gemini (`gemini-2.5-flash`) via LangChain.
- **Toolbox**:
  - `WebScraperTool`: Extracts information from provided URLs.
  - `GmailReaderTool`: Authenticates via user OAuth tokens to read emails.
  - `CreateCalendarEventTool`: Automatically schedules events on Google Calendar.
  - `DocumentQueryTool`: Performs RAG (Retrieval-Augmented Generation) on PDF files.
  - `AdvisorTool`: Generates structured academic/career roadmaps.
  - `ContestScannerTool`: Tracks competitive programming contests (LeetCode, Codeforces).
  - `EventParserTool`: Natural language extraction of dates/times for scheduling.

### 2. Automated Updates (The Scheduler)
Located in `app/services/scheduler_service.py`, this component handles "autopilot" features.
- **Daily Scans**: Periodically scans a user's Gmail inbox.
- **Classification**: Sends email snippets to a HuggingFace API (`campus-mail-classifier-api`) to identify categories: `CAREER`, `EVENT`, `DEADLINE`, `GENERAL`.
- **Filtering**: Automatically weeds out `SPAM/PROMO` and prioritizes high-confidence updates.

### 3. Data Layer
- **ORM**: SQLAlchemy.
- **Models**:
  - `User`: Stores user info and Google refresh tokens.
  - `ImportantUpdate`: Stores the classified and summarized notifications.
  - `Feedback`: Captures user corrections to improve classification.

---

## 🎨 Frontend Deep Dive (`/frontend`)

The frontend is a **Next.js 16** application optimized for speed and user experience.

### 1. Unified Dashboard
- **Components**:
  - `Sidebar.tsx`: Navigation between Home, Chat, Updates, and Advisor.
  - `ChatSection.tsx`: A streaming chat interface for interacting with the Gemini agent.
  - `UpdatesView.tsx`: A clean feed showing the prioritized updates fetched from the backend.
  - `AdvisorView.tsx`: Displays generated roadmaps and career guidance.
  - `LandingPage.tsx`: The initial entry point for unauthenticated users.

### 2. Modern Stack
- **Styling**: Tailwind CSS for responsive and dark-mode-ready UI.
- **Animations**: Framer Motion for smooth transitions.
- **Client-Side AI**: Integrates `Transformers.js` and `HuggingFace Inference` for potentially handling some AI tasks directly in the browser.

---

## 🔗 Integration & Workflow

1.  **Authentication**: Users sign in via Google. The backend stores the refresh token to enable background email scanning.
2.  **Productivity Loop**:
    - The **Scheduler** identifies a "Deadline" email.
    - It saves an "Important Update" to the database.
    - The user sees this in their **Updates** feed.
    - The user can ask the **Chatbot**, "Schedule the deadline from my updates," and the Agent uses the `CalendarTool` to add it to their Google Calendar.
3.  **Real-time Interaction**:
    - The frontend uses **Server-Sent Events (SSE)** via the `/api/chat/stream` endpoint for a typing-effect response from the AI.

---

## 📂 Key Files Reference

| File | Purpose |
| :--- | :--- |
| `backend/app/main.py` | API Entry point and router configuration. |
| `backend/app/agent/orchestrator.py` | LLM configuration and tool definition. |
| `backend/app/services/scheduler_service.py` | Email scanning and classification logic. |
| `frontend/app/page.tsx` | Main application entry (renders Dashboard). |
| `frontend/components/ChatSection.tsx` | Chat UI and SSE integration. |
| `frontend/package.json` | Comprehensive list of frontend dependencies. |
