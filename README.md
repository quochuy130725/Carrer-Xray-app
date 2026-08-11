# 📡 CAREER X-RAY

> **Decode the JD. Unmask the trap.**
> *An Interactive Web-App Educational Toolkit for Job Scam & Botnet Seeding Detection (Global MIL Educational Edition).*

[![Tech Stack](https://img.shields.io/badge/Stack-React_|_Tailwind_|_Node.js_|_MongoDB_|_Gemini_AI-61DAFB?style=flat-square)](#-tech-stack-specification)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 📖 Overview

**CAREER X-RAY** is an AI-powered educational Web-App designed to enhance **Media and Information Literacy (MIL)** and critical thinking skills among university students and fresh graduates navigating the modern job market.

Simulating a realistic job board interface, **CAREER X-RAY** empowers users to activate real-time interactive analysis modes:

- 🔴 **[DECODE JD]:** Dynamically highlights dangerous "Red Flags" (upfront deposit scams, unrealistic salary claims, manipulative phrasing) directly inside job descriptions and benchmarks parameters against actual labor market standards. For verified posts, displays a `🟢 BÀI ĐĂNG ĐẠT CHUẨN MINH BẠCH` compliance badge.
- 🤖 **[SEEDING X-RAY]:** Unmasks AI-driven botnet and clone accounts in the comment section. Displays a **Botnet Seeding Ratio Bar** (e.g. *75% Nick Ảo*), morphs user avatars into animated Robot icons with red pulsing halos, and provides **Hover Pop-up Cards** showing 3 forensic clone signals.
- 💡 **MIL Competency Card:** Displays concise digital literacy prompts ("3 KHÔNG" rules & tax code verification) to help candidates evaluate opportunities before submitting CVs or financial commitments.
- 🗂️ **Nested Case Study Library:** Features 5 major risk categories containing 9+ real-world job scam posts (Media X deposit scam, AMRITA multi-task exploitation, FPT Software transparent baseline, Telegram task escalation traps, etc.).
- 🔬 **Custom JD Inspector:** Paste any raw job description text from Facebook, Threads, or Telegram directly into the module for instant AI-powered real-time Red Flag analysis.

---

## 🏗️ System Architecture & Production Workflow

When **CAREER X-RAY** transitions to a live production environment, the platform operates through two primary execution workflows:

```text
[ FRONTEND (REACT) ]
       │
       ├─── 1. Explore Sample Case Studies ──► [ GET /api/cases ] ──► [ MONGODB ATLAS ]
       │
       └─── 2. Inspect Custom JD Text ───────► [ POST /api/analyze ]
                                                      │
                                                      ▼
                                         [ BACKEND REGEX / AI ENGINE ]
                                                      │
                                                      ├── (Extract Red Flags)
                                                      ├── (Persist Audit to MongoDB)
                                                      └── (Return Real-Time Stream to UI)
```

### 1. Workflow 1: Curated Case Studies (Educational Hub)
- **Frontend:** On initial application load, the React client issues a `GET /api/cases` request to fetch verified data.
- **Backend:** Queries the MongoDB Atlas instance (`Job.find({})`) and returns the structured Case Study categories.
- **Objective:** Empowers students to review authentic scam patterns, identify manipulative seeding tactics, and strengthen critical thinking aligned with the **MIL (Media & Information Literacy)** framework.

### 2. Workflow 2: Custom Job Description Inspector (Real-Time Analysis)
- **Step 1 (Input):** The user pastes raw job description text from social platforms (Facebook, Threads, LinkedIn) into the `[ CUSTOM JD INSPECTOR ]` module.
- **Step 2 (API Dispatch):** The Frontend dispatches a `POST /api/analyze` request with the JSON payload `{ jdText: "..." }`.
- **Step 3 (Backend Processing):**
  - **Detection Engine:** Leverages pattern matching, regex rule sets, or LLM APIs (`gemini-2.5-flash`) to automatically detect high-risk signals.
  - **Data Persistence:** Automatically generates an audit document and stores the analysis metadata in the `scanned_jobs` MongoDB collection.
- **Step 4 (UI Render):** The Backend returns real-time Red Flag breakdowns, risk severity levels, and market compliance benchmarks back to the client interface.

---

## 🛠️ Tech Stack Specification & Recent Architectural Upgrades

### Recent Upgrades (v1.3)
- **Modular Frontend Architecture:** Reorganized `src/components/` into scalable subdirectories (`layout/`, `hero/`, `workspace/`, `mil/`, `ui/`).
- **Plainthing Studio Button Aesthetic:** Primary CTA buttons redesigned to Solid Dark Pill containers with integrated SVG icon badges — zero emojis, zero AI gradients.
- **Bilingual i18n (EN/VI):** Full bilingual support dynamically switching via `[ EN | VI ]` toggle with zero layout jumps, powered by `translations.js`.
- **Yellow Flag Micro-Copy:** Medium-risk flags now surface constructive verification checkpoints (e.g., corporate email check, shift clarification) instead of alarming scam warnings.
- **Red Flag Detail Fix:** Active flag detail box correctly resolves `phrase_vi` / `phrase_en` based on active language selection.
- **MIL Trademark Compliance:** All "UNESCO" branding replaced with generic MIL terminology to prevent trademark conflicts.
- **Universal Dual-Language Support:** Schema mapping across UI and components utilizes `_vi` and `_en` suffixes for full dual-data support.
- **Client-Side Caching:** Fast switching between case studies with instant loading using memory dict caching (`jobsCache`).
- **Unicode NFC Normalization:** Vietnamese text highlighting implements `.normalize('NFC')` to resolve cross-platform Unicode equivalence bugs.

### Frontend (Client-side)
- **Core Framework:** React.js (built with **Vite**)
- **Styling & UI:** Tailwind CSS (Vanilla CSS Directives & Custom Color Tokens)
- **Animation:** Framer Motion (`framer-motion`) — `useSpring`, `useMotionValue`, `AnimatePresence`
- **Iconography:** Lucide React (`lucide-react`)
- **State Management:** React Hooks (`useState`, `useMemo`, `useEffect`, `useCallback`)

### Backend (Server-side)
- **Runtime Environment:** Node.js (>= 18.x)
- **Web Framework:** Express.js (RESTful API Architecture)
- **Database & Persistence:** MongoDB (Mongoose ORM) + Local JSON (`data/jobs.json`) as a 100% Fail-safe Fallback Layer.
- **Middleware:** CORS, `dotenv`, Centralized `errorHandler`, Rate Limiter

### AI Engine & SDK Integration
- **AI Model:** Google Gemini 2.5 Flash API (`gemini-2.5-flash`)
- **SDK:** Official Google Gen AI SDK (`@google/genai`)
- **Data Formatting:** Enforced **Structured JSON** via `responseSchema`

---

## 📁 Project Structure

```text
career-xray/
├── frontend/                   # React.js SPA (Client)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Top-level shell & structure
│   │   │   │   ├── Navbar.jsx      # Brand Header & Language Toggle
│   │   │   │   └── Sidebar.jsx     # Nested Case Category Accordion & Job Selector
│   │   │   │
│   │   │   ├── hero/           # Hero section & 3D kinetic elements
│   │   │   │   ├── HeroMascot3D.jsx  # Interactive 3D Scanner Bot
│   │   │   │   ├── Hero3DShield.jsx  # Parallax tilt glassmorphism shield
│   │   │   │   └── Hero3DObject.jsx  # Floating 3D ambient object
│   │   │   │
│   │   │   ├── workspace/      # Core job diagnostic & inspection modules
│   │   │   │   ├── JobCard.jsx         # JD Display & Red Flag Highlighting
│   │   │   │   ├── DecodeView.jsx      # Red Flag Breakdown & Market Benchmark Panel
│   │   │   │   ├── CustomInspector.jsx # Custom JD paste & image analysis module
│   │   │   │   └── CommentList.jsx     # Comment Section, Botnet Ratio & Clone Signals
│   │   │   │
│   │   │   ├── mil/            # Media & Information Literacy components
│   │   │   │   └── MilCard.jsx     # MIL Competency & Verification Rules Card
│   │   │   │
│   │   │   └── ui/             # Reusable UI primitives & utilities
│   │   │       ├── SpotlightCard.jsx   # Mouse-tracking radial glow wrapper
│   │   │       └── ErrorBoundary.jsx   # React crash boundary (white-screen guard)
│   │   │
│   │   ├── locales/
│   │   │   └── translations.js # Bilingual i18n (EN/VI) translation store
│   │   │
│   │   ├── App.jsx             # Main State Management & API Pipeline
│   │   ├── index.css           # Tailwind Directives & CSS Rules
│   │   └── main.jsx            # React Entry Point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                    # Node.js + Express REST API (Server)
│   ├── config/
│   │   ├── db.js               # MongoDB connection setup (Mongoose)
│   │   └── gemini.js           # Google Gen AI SDK client & config
│   │
│   ├── middleware/
│   │   ├── errorHandler.js     # Centralized error handling middleware
│   │   └── rateLimiter.js      # API rate limiting & anti-spam middleware
│   │
│   ├── routes/
│   │   └── scanRoutes.js       # REST Endpoints (/api/cases, /api/analyze)
│   │
│   ├── controllers/
│   │   └── scanController.js   # HTTP Request & Response Handlers
│   │
│   ├── services/
│   │   ├── geminiService.js    # Gemini 2.5 API integration logic
│   │   ├── regexService.js     # Pattern matching detection engine
│   │   └── fallbackService.js  # Fail-safe logic reading jobs.json / MongoDB
│   │
│   ├── utils/
│   │   ├── jsonReader.js       # Safe JSON file reading helper
│   │   └── logger.js           # Custom logger utility
│   │
│   ├── models/
│   │   ├── Job.js              # Job, RedFlag & Comment Mongoose Schema
│   │   └── ScannedJob.js       # Audit Log Schema for /api/analyze queries
│   │
│   ├── scripts/
│   │   └── seed.js             # Automated database seeder script
│   │
│   ├── data/
│   │   └── jobs.json           # Local Fallback Dataset (9+ Real Case Studies)
│   │
│   ├── .env                    # Environment variables template
│   ├── package.json
│   └── server.js               # Express Server Entry Point
│
└── README.md
```

---

## 🚀 Local Installation & Setup Guide

### Prerequisites
- **Node.js:** >= 18.x
- **npm:** >= 9.x
- **MongoDB:** Local instance on `mongodb://localhost:27017` (Optional — defaults to JSON fallback)
- **Google Gemini API Key:** (Optional, obtain free at Google AI Studio)

---

### 1. Clone Repository
```bash
git clone https://github.com/quochuy130725/Carrer-Xray-app.git
cd Carrer-Xray-app
```

---

### 2. Setup & Run Backend (Express Server)

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key_here
MONGO_URI=mongodb://localhost:27017/career_xray
```

*(Optional) Seed Database into MongoDB:*
```bash
npm run seed
```

Start the Backend Development Server:
```bash
npm run dev
# Or production mode: npm start
```
*Backend Server will run at:* `http://localhost:5000`

---

### 3. Setup & Run Frontend (React + Vite)

Open a new Terminal window:
```bash
cd frontend
npm install
npm run dev
```
*React Application will run at:* `http://localhost:5173`

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
