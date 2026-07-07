# JusticeGrid
**AI-Powered Judicial Decision Support Platform**

JusticeGrid is an enterprise-grade legal technology platform designed to transform court case management using deterministic legal mathematics, multi-agent Large Language Model (LLM) deliberation, and real-time synchronized dashboards. It bridges the gap between the rigid statutory requirements of the judicial system and the nuanced reasoning of artificial intelligence.

## System Architecture

JusticeGrid operates on a **Directed Acyclic Graph (DAG) Multi-Agent Architecture** powered by LangGraph, rather than relying on a single conversational LLM. 

1. **Deterministic Guardrails**: Statutory calculations (e.g., Section 436A CrPC limits regarding maximum detention periods) are calculated using strict Python logic. The LLM cannot override mathematical facts.
2. **Specialist Agents**: The system orchestrates five distinct AI personas:
   - **Intake Agent**: Parses the FIR and standardizes facts.
   - **Eligibility Agent**: Evaluates strict statutory compliance.
   - **Delay Agent**: Analyzes procedural delays and assigns fault (prosecution vs. defense).
   - **Financial Agent**: Assesses the undertrial's financial capacity for surety.
   - **Strategy Agent**: Formulates a cohesive legal argument.
3. **The Judge Node**: A final consensus layer that synthesizes the specialist deliberations into a structured, formal legal order.
4. **Provider Failover**: The backend seamlessly falls back across Groq, OpenRouter, and Gemini to ensure 100% uptime during live courtroom sessions.

## Real-Time Synchronization

JusticeGrid abandons static data fetching. Built on **Firebase Firestore `onSnapshot` listeners**, the entire platform is reactive:
- When a Lawyer initiates an AI analysis, the **Live AI Courtroom** renders immediately.
- As agents deliberate on the backend, the frontend UI animates the active speaker, generates their reasoning with confidence scores, and plots it in the transcript.
- When the Judge Node reaches a verdict, the "Family Portal" dashboard updates instantly across the globe without requiring a page refresh, translating the verdict into plain English, Hindi, or Marathi.

## Tech Stack

### Frontend
- **React.js** (Vite)
- **Framer Motion** (Cinematic UI, parallax timelines, complex courtroom layout animations)
- **Firebase Auth & Firestore** (Real-time reactive state)
- **jsPDF** (Automated generation of watermarked, court-standard legal transcripts)
- **Vanilla CSS** (Strict enforcement of a professional creme/beige legal aesthetic)

### Backend
- **FastAPI** (Python 3)
- **LangGraph & LangChain** (Multi-agent orchestration and prompt engineering)
- **WebSockets** (Streaming live agent deliberations to the frontend)
- **Groq / OpenRouter / Google Gemini** (LLM inference infrastructure)

## Setup & Deployment

### 1. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
GROQ_API_KEY=your_key
OPENROUTER_API_KEY=your_key
GEMINI_API_KEY=your_key
```

### 2. Run Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Run Frontend
```bash
npm install
npm run dev
```

## Security & Access Control
JusticeGrid strictly isolates data:
- **Family Members** can only subscribe to cases explicitly linked to their `familyId`.
- **Lawyers** only have visibility and execution rights over their assigned roster.
- **Administrators** possess global observability over system health, API latency, and token consumption via a dedicated telemetry dashboard.

---
*Built for modern judicial infrastructure.*
