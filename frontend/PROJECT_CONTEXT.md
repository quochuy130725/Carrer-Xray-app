# 📡 PROJECT CONTEXT & AI CODING INSTRUCTIONS: CAREER X-RAY

> File này chứa toàn bộ ngữ cảnh, kiến trúc và quy chuẩn lập trình của dự án **CAREER X-RAY** dành cho AI Coding Assistant (Cursor, Antigravity, Windsurf).

---

## 1. PROJECT OVERVIEW
* **Project Name:** CAREER X-RAY
* **Slogan:** *"X-Ray the JD. Unmask the trap."*
* **Domain:** Interactive Web-App Educational Toolkit (UNESCO MIL Project - Media and Information Literacy).
* **Core Problem:** Help students and fresh graduates detect job scams (upfront fees, fake KPIs, toxic culture) and unmask automated Botnet/Seeding comments under job posts.

---

## 2. TECH STACK SPECIFICATION
* **Frontend:** React.js (Vite), Tailwind CSS, Lucide React Icons (`lucide-react`).
* **Backend:** Node.js, Express.js (RESTful API Architecture).
* **AI Engine:** Google Gemini 2.5 Flash API (`gemini-2.5-flash`) via `@google/genai` SDK.
* **AI Output:** Enforced **Structured JSON** using `responseSchema`.
* **Data Resilience:** Local JSON Mock Database (`backend/data/jobs.json`) for Fail-safe Fallback.

---

## 3. CORE FEATURES & UI STATES

### A. Interactive Job Feed
A simulated social media job board displaying job cards, company info, raw JD text, and a comments section.

### B. [DECODE JD] Mode
* **Trigger:** Click the `[DECODE JD]` button.
* **Behavior:** Highlights dangerous "Red Flag" phrases directly inside the raw text with a red background (`#ff2a55`).
* **Interaction:** Hovering or clicking a highlighted Red Flag displays a Tooltip/Modal explaining the warning reason and comparing it to Market Benchmarks.

### C. [SEEDING X-RAY] Mode
* **Trigger:** Click the `[SEEDING X-RAY]` button.
* **Behavior:** Detects Botnet/Seeding comments in the comment list.
* **Morphing:** Replaces the user's avatar with a Red Robot Icon, adds a subtle red border/background to the comment card, and renders a badge explaining the seeding tactic (e.g., Fake Social Proof, Urgency Bait).

### D. UNESCO MIL Reflection Card
Displays a concise critical thinking prompt summarizing key takeaways after analyzing each Case Study.

---

## 4. ARCHITECTURE & FALLBACK MECHANISM (DECOUPLED REST API)

[React Frontend] <---> HTTP REST API <---> [Express Backend] <---> [Gemini 2.5 API]
│
└── (Fallback > 2.5s / Error) ──> [jobs.json]


### Endpoints
* `GET  /api/health` — Server health check.
* `POST /api/scan/jd` — Analyzes raw JD text and returns Red Flags.
* `POST /api/scan/comments` — Scans comment list and returns detected Botnet accounts.

### Fail-safe Strategy (100% Uptime)
If calling the Gemini API fails, times out (> 2.5s), or encounters a quota/network error, the backend MUST gracefully fall back to reading pre-labeled data from `backend/data/jobs.json` and return a response object containing `mode: "OFFLINE_FALLBACK"`.

## 5. FRONTEND STRUCTURE & TAILWIND CONFIG
```text
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Brand Header & Logo
│   │   ├── JobCard.jsx         # Raw JD & Red Flag Highlighting Logic
│   │   ├── CommentList.jsx     # Comment Section & Bot Morphing Logic
│   │   └── MilCard.jsx         # UNESCO Reflection Card
│   ├── App.jsx                 # Global State & API Dispatcher
│   ├── index.css               # Tailwind Directives
│   └── main.jsx


## 6. AI CODING RULES
Write clean, modular, modern React code using React Hooks (useState, useEffect).

Always ensure UI components are responsive, accessible, and handle loading/error states smoothly.

Keep logic decoupled between UI components and API calls.

Do not alter the core data schemas without maintaining backwards compatibility with jobs.json.