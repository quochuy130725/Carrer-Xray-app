# 📡 CAREER X-RAY

> **Decode the JD. Unmask the trap.**  
> *An Interactive Web-App Educational Toolkit for Job Scam & Botnet Seeding Detection (UNESCO MIL Project).*

[![Tech Stack](https://img.shields.io/badge/Stack-React_|_Tailwind_|_Node.js_|_Gemini_AI-61DAFB?style=flat-square)](#-tech-stack-specification)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 📖 Overview

**JOB RADAR** is an AI-powered educational Web-App designed to enhance **Media and Information Literacy (MIL)** and critical thinking skills among university students and fresh graduates navigating the modern job market.

Simulating a realistic job board interface, **JOB RADAR** empowers users to activate two real-time interactive analysis modes:

- 🔴 **[DECODE JD]:** Highlights dangerous "Red Flags" (upfront fee scams, unrealistic KPIs, manipulative phrasing) and benchmarks offer parameters against actual labor market standards.
- 🤖 **[SEEDING X-RAY]:** Unmasks AI-driven botnet and clone accounts in the comment section, transforming user avatars into robot icons while exposing fake social proof tactics.
- 💡 **UNESCO MIL Reflection Card:** Displays concise critical thinking prompts to help candidates evaluate opportunities before submitting CVs or financial commitments.

---

## 🛠️ Tech Stack Specification

### Frontend (Client-side)
- **Core Framework:** React.js (built with **Vite**)
- **Styling & UI:** Tailwind CSS, PostCSS
- **Iconography:** Lucide React (`lucide-react`)
- **State Management:** React Hooks (`useState`, `useEffect`)

### Backend (Server-side)
- **Runtime Environment:** Node.js
- **Web Framework:** Express.js (RESTful API Architecture)
- **Middleware:** CORS, `dotenv`

### AI Engine & SDK Integration
- **AI Model:** Google Gemini 2.5 Flash API (`gemini-2.5-flash`)
- **SDK:** Official Google Gen AI SDK (`@google/genai`)
- **Data Formatting:** Enforced **Structured JSON** via `responseSchema`

### Data Layer & Resilience
- **Database:** Local JSON Mock DB (`jobs.json`)
- **Architecture Pattern:** **Decoupled Dual-Mode REST API** (Automatically falls back to local data if network latency exceeds 2.5 seconds, ensuring 1–2ms response time).

---

## 📁 Project Structure

```text
job-radar/
├── frontend/                   # React.js SPA (Client)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/         # Reusable React UI Components
│   │   │   ├── Navbar.jsx      # Header & Brand Logo
│   │   │   ├── JobCard.jsx     # JD Display & Red Flag Highlighting
│   │   │   ├── CommentList.jsx # Comment Section & Bot Morphing
│   │   │   └── MilCard.jsx     # UNESCO MIL Reflection Card
│   │   ├── App.jsx             # Main App Layout & State Management
│   │   ├── index.css           # Tailwind Directives & Custom CSS
│   │   └── main.jsx            # React Entry Point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                    # Node.js + Express REST API (Server)
│   ├── config/
│   │   ├── db.js               # MongoDB connection & Mongoose setup
│   │   └── gemini.js           # Gemini 2.5 Flash SDK initialization
│   │
│   ├── middleware/
│   │   ├── errorHandler.js     # Global Error Handler
│   │   └── rateLimiter.js      # Request rate limiting (Optional)
│   │
│   ├── routes/
│   │   └── scanRoutes.js       # REST Endpoints (/api/scan/jd, /api/scan/comments)
│   │
│   ├── controllers/
│   │   └── scanController.js   # Orchestrates Gemini Service & Fallback Service
│   │
│   ├── services/
│   │   ├── geminiService.js    # Business Logic & Prompt Engineering for Gemini API
│   │   └── fallbackService.js  # FAIL-SAFE mechanism (reads jobs.json & MongoDB)
│   │
│   ├── utils/
│   │   ├── jsonReader.js       # Safe JSON file reading helper
│   │   └── logger.js           # Custom logger utility
│   │
│   ├── data/
│   │   └── jobs.json           # Local Mock DB & Pre-labeled Fallback Data
│   │
│   ├── .env.example            # Environment variables template
│   ├── package.json
│   └── server.js               # Express Server Setup & Listener
│
└── README.md                   # Project Documentation


🚀 Local Installation & Setup Guide
Prerequisites
## Node.js >= 18.x

## npm >= 9.x

Google Gemini API Key (Obtain a free key at Google AI Studio)

1. Clone Repository

git clone [https://github.com/](https://github.com/)<your-username>/job-radar.git
cd job-radar
2. Setup Backend (Express Server)

Bash
cd backend
npm install
Create a .env file inside the backend/ directory:


PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key_here
Start the Backend Server:


node server.js
Server will run at: http://localhost:5000

3. Setup Frontend (React + Vite)
Open a new Terminal window:

Bash
cd job-radar/frontend
npm install
Start the Frontend Development Server:

Bash
npm run dev
React Application will run at: http://localhost:5173


