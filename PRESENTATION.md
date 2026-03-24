# StudySync: Autonomous Agentic AI for University Navigation
## Highly Technical Presentation Deck Content (9 Slides)

---

### **Slide 1: Title Slide**
*   **Title:** StudySync - Autonomous Agentic AI for University Navigation
*   **Subtitle:** Unifying the Student Experience through Large Language Models, Generative Agents, and Active Learning
*   **Presenter:** [Your Name]
*   **Live Demo:** [https://studysync-tau-rust.vercel.app/](https://studysync-tau-rust.vercel.app/)
*   **GitHub Repository:** [https://github.com/riaan-attar/studysync](https://github.com/riaan-attar/studysync)
*   **Visual Suggestion:** High-tech conceptual diagram showing a central "Brain" (LLM Agent) making API connections to Gmail, Google Calendar, PDF Scrapers, and WhatsApp.

---

### **Slide 2: Problem Statement: The Fragmentation of Academic Context**
*   **Title:** The Fragmentation of Academic Context
*   **Sub-point 1: Massive Data Silos**
    *   Students must navigate a highly fragmented digital ecosystem: unstructured emails for critical deadlines, complex PDF syllabi, disparate university portals, and external sites (LeetCode/Codeforces) for career development.
*   **Sub-point 2: The Cognitive Load Bottleneck**
    *   Constant context switching between platforms directly leads to structural mismanagement. Critical opportunities (career fairs, assignment submissions, hackathons) are missed due to sheer volume, not lack of intent.
*   **Sub-point 3: Ineffective Legacy Solutions**
    *   Traditional productivity applications (Notion, Google Calendar plugins) require heavy manual data-entry. They are strictly reactive systems; they lack *semantic understanding* or *autonomous action* capabilities to interpret unstructured data.
*   **Speaker Notes:** Emphasize that the core problem isn't a lack of tools, but rather the absence of an *integrated intelligence layer* that can seamlessly process unstructured data across these silos without manual human intervention.

---

### **Slide 3: The Solution: StudySync Agentic Pipeline**
*   **Title:** StudySync: An Autonomous Agentic Pipeline
*   **Sub-point 1: From "Assistants" to "Agents"**
    *   We shift the paradigm from reactive query-answering (like standard ChatGPT) to proactive, autonomous execution. The AI isn't just generating text; it is modifying backend state.
*   **Sub-point 2: The Core Orchestrator**
    *   Powered by LangChain and Google's `gemini` framework (`gemma-3-27b-it` / `gemini-3.1-flash-lite`), acting as the central reasoning engine parsing user intent.
*   **Sub-point 3: Multi-Modal Context Ingestion**
    *   The system actively ingests unstructured data from three main vectors: live DOM scraping (Web), automated Gmail REST API polling (Email), and Local Retrieval-Augmented Generation (PDFs).
*   **Sub-point 4: Proactive Execution**
    *   Upon extracting structured semantic meaning (dates, priority, events), the orchestrator autonomously fires API requests to write to the user's Google Calendar or push instant updates to external notification channels.

---

### **Slide 4: Equipping the LLM with "Hands" (Tool Calling Ecosystem)**
*   **Title:** Equipping the LLM with "Hands" (Tool Calling)
*   **Content:** The Agent executes specific modular Python functions (`@tool`) mapped to LLM tool-calling capabilities.
    *   **Context Retrieval Tools:**
        *   **`WebScraperTool` & `ContestScannerTool`:** Beautiful Soup/requests wrapper parsing raw DOM tree strings (LeetCode/Codeforces) into chunked LLM context.
        *   **`DocumentQueryTool` (RAG):** Local Retrieval-Augmented Generation pipeline utilizing PyPDF and pdf-lib. Documents are chunked, embedded, and mapped via vector similarity to handle queries regarding complex syllabus constraints.
    *   **Execution Tools:**
        *   **`EventParserTool` & `CreateCalendarEventTool`:** Utilizes Pydantic to enforce strict JSON schemas on the LLM output, extracting ISO 8601 timestamps and geographical locations from natural language to format robust Google Calendar API REST calls.
        *   **`AdvisorTool`:** Generates highly rigid, structured JSON strategic roadmaps rendered dynamically into Next.js React components on the frontend.
*   **Speaker Notes:** Highlight that the LLM is making autonomous, probabilistic decisions on *which* specific subset of tools to invoke based purely on the semantic meaning of the user's prompt (ReAct logic).

---

### **Slide 5: Automated Data Pipeline: NLP Mail Classification**
*   **Title:** Background Inbox Intelligence
*   **Content:** An asynchronous chron-based pipeline separating signal from noise in a student's inbox.
    *   **The Pipeline Engine:** Background asynchronous task scheduler (`APScheduler`) securely fetches an aggregated JSON payload of unread emails via the Gmail API using rotating OAuth 2.0 refresh tokens.
    *   **Inference Endpoint Integration:** Emails are piped through a custom-deployed HuggingFace Inference API , ensuring the heavy LLM orchestrator is not bottlenecked by routine classification.
    *   **Semantic Categorization:** Utilizing Zero-Shot/Few-Shot classification, incoming text is categorized into defined parameters: `CAREER`, `EVENT`, `DEADLINE`, `GENERAL`, or `SPAM/PROMO`.
    *   **Probabilistic Filtering:** The system applies a strict confidence threshold heuristic ($p > 0.30 \land label \neq SPAM$). Only emails passing this logic gate are persisted to the Supabase PostgreSQL database under the `ImportantUpdate` schema.

---

### **Slide 6: Reinforcement via Human Feedback (Active Learning)**
*   **Title:** Reinforcement via Human Feedback (Active Learning)
*   **Content:** Addressing the inherent challenges of LLM hallucinations and domain drift.
    *   **The Domain Drift Problem:** University environments constantly introduce new terminology (e.g., a new obscure tech stack in a hackathon email being flagged as Spam instead of Career).
    *   **Dual Feedback UI Implementation:** The Next.js frontend integrates a fluid, seamless binary feedback mechanism (Correct/Incorrect classification flag) mapped to every surfaced email update.
    *   **Database Mutability:** A dedicated `Feedback` PostgreSQL table tracks `update_id`, `user_id`, `is_correct`, and `predicted_label`.
    *   **The Resulting Cycle:** False positives are instantly toggled via a FastAPI REST call (`is_important=False`), immediately dropping them from the user's DOM. Furthermore, this raw structured dataset is aggregated to serve as the fine-tuning corpus for the next iteration of the HuggingFace model.

---

### **Slide 7: Pushing Context to the Edge (WhatsApp Notifications)**
*   **Title:** Pushing Context to the Edge: Autonomous WhatsApp Notifications
*   **Content:** Eliminating the requirement for active app engagement through edge notification delivery.
    *   **The Paradigm Shift:** For an agent to be truly autonomous, the user should not have to open the client application to poll for critical information. The agent must push critical context natively.
    *   **Integration Layer Architecture:** Utilizing the Twilio WhatsApp Business API (or Meta Cloud API) tightly coupled with the backend `scheduler_service.py` background processes.
    *   **Technical Workflow Step-by-Step:**
        1.  `APScheduler` independently fetches and flags a high-priority email class (e.g., `DEADLINE` or `CAREER`).
        2.  FastAPI event loops evaluate the confidence score and fire a webhook/payload.
        3.  A background thread invokes the WhatsApp Messaging API to compile and send the alert.
    *   **JSON Payload Example Outcome:** User instantly receives a structured rich-text WhatsApp message: *"🚨 [DEADLINE] CS401 Assignment 3 is due tonight. I have autonomously added it to your Google Calendar."*

---

### **Slide 8: Visual Architecture Diagram**
*   **Title:** System Architecture & Frameworks
*   **Visual Suggestion:** A detailed, expansive architectural diagram covering the entire flow. (You should recreate this dynamically in your presentation software).
    *   **Component 1 (Left):** **Client Layer.** Next.js 16, React 19, TailwindCSS 4, Framer Motion. Handles routing, session state, and glassmorphic UI.
    *   **Component 2 (Bottom):** **Data & Auth Layer.** Supabase Remote PostgreSQL handling JWT-based OAuth, Row Level Security (RLS), and schema persistence (`Users`, `ImportantUpdate`, `Feedback`).
    *   **Component 3 (Center):** **The Microservice Core.** Python 3 / FastAPI server exposing asynchronous REST endpoints (`/api/chat`, `/api/updates`). Contains the LangChain Core mapping out `gemma-3-27b-it` tool nodes.
    *   **Component 4 (Top/Background):** **Persistent Services.** Environment hosted on Koyeb (Docker Containerization) allowing the `APScheduler` cron jobs to run 24/7 without serverless cold-start limitations.
    *   **Component 5 (Right):** **External External APIs.** Bi-directional arrows pointing to Google APIs (Calendar, Gmail), HuggingFace Inference Endpoint, and Twilio WhatsApp API.
*   **Speaker Notes:** Point out exactly how a user request flows from the Client (Left), hits the Core Microservice (Center), which then delegates action to either the Data Layer (Bottom) or External APIs (Right).

---

### **Slide 9: Conclusion & Future Scope**
*   **Title:** Conclusion: The Future of the Agentic Student
*   **Sub-point 1: Core Technical Achievement**
    *   Successfully transitioned from baseline reactive Retrieval-Augmented Generation (RAG) to an autonomous ecosystem ecosystem capable of taking definitive, side-effect actions (Database mutations, Calendar configurations, WhatsApp alerts) strictly via unstructured natural language triggers.
*   **Sub-point 2: Live Project Context**
    *   **Live Demo:** [https://studysync-tau-rust.vercel.app/](https://studysync-tau-rust.vercel.app/)
    *   **Source Code:** [https://github.com/riaan-attar/studysync](https://github.com/riaan-attar/studysync)
*   **Sub-point 3: Scalability & Future Roadmap**
    *   **Multi-Agent Collaboration:** Utilizing LangGraph to design dedicated, localized agents ("Tutor Agent", "Schedule Agent", "Career Agent") that intercommunicate via shared state graphs and delegate sub-tasks autonomously.
    *   **Voice Modality Optimization:** Integrating real-time WebSockets for sub-second latent conversational voice advising.
    *   **Enterprise Integrations:** Building OAuth bridges for Canvas LMS APIs and GitHub APIs to pull commit/assignment data directly into the agentic context frame.
*   **Final Statement:** Agentic AI is moving software development from the paradigm of "Do this for me" to the definitive reality of "I have done this for you."
