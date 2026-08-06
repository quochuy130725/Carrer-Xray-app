📡 JOB RADAR (CAREER X-RAY)Decode the JD. Unmask the trap.An Interactive Web-App Educational Toolkit for Job Scam & Botnet Seeding Detection (UNESCO MIL Project).📖 OverviewJOB RADAR is an AI-powered educational Web-App designed to enhance Media and Information Literacy (MIL) and critical thinking skills among university students and fresh graduates navigating the modern job market.Simulating a realistic job board interface, JOB RADAR empowers users to activate two real-time interactive analysis modes:🔴 [DECODE JD]: Highlights dangerous "Red Flags" (upfront fee scams, unrealistic KPIs, manipulative phrasing) and benchmarks offer parameters against actual labor market standards.🤖 [SEEDING X-RAY]: Unmasks AI-driven botnet and clone accounts in the comment section, transforming user avatars into robot icons while exposing fake social proof tactics.💡 UNESCO MIL Reflection Card: Displays concise critical thinking prompts to help candidates evaluate opportunities before submitting CVs or financial commitments.🛠️ Tech Stack SpecificationFrontend (Client-side)Core Framework: React.js (built with Vite)Styling & UI: Tailwind CSS, PostCSSIconography: Lucide React (lucide-react)State Management: React Hooks (useState, useEffect)Backend (Server-side)Runtime Environment: Node.jsWeb Framework: Express.js (RESTful API Architecture)Middleware: CORS, dotenvAI Engine & SDK IntegrationAI Model: Google Gemini 2.5 Flash API (gemini-2.5-flash)SDK: Official Google Gen AI SDK (@google/genai)Data Formatting: Enforced Structured JSON via responseSchemaData Layer & ResilienceDatabase: Local JSON Mock DB (jobs.json)Architecture Pattern: Decoupled Dual-Mode REST API (Automatically falls back to local data if network latency exceeds 2.5 seconds, ensuring 1–2ms response time).📁 Project StructurePlaintextjob-radar/
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
│   ├── controllers/
│   │   └── scanController.js   # Gemini 2.5 Flash Integration & Fallback Logic
│   ├── data/
│   │   └── jobs.json           # Local Mock DB & Fail-safe Backup Data
│   ├── routes/
│   │   └── scanRoutes.js       # REST Endpoints (/api/scan/jd, /api/scan/comments)
│   ├── .env.example            # Environment variables template
│   ├── package.json
│   └── server.js               # Express Server Setup & Listener
│
└── README.md                   # Project Documentation
⚙️ REST API Endpoints OverviewMethodEndpointDescriptionRequest Body ExampleGET/api/healthVerifies server operational statusN/APOST/api/scan/jdAnalyzes JD text, extracts Red Flags & market deviations{ "jdText": "..." }POST/api/scan/commentsScans comments and flags botnet seeding accounts{ "comments": [...] }🚀 Local Installation & Setup GuidePrerequisitesNode.js >= 18.xnpm >= 9.xGoogle Gemini API Key (Obtain a free key at Google AI Studio)1. Clone RepositoryBashgit clone https://github.com/<your-username>/job-radar.git
cd job-radar
2. Setup Backend (Express Server)Bashcd backend
npm install
Create a .env file inside the backend/ directory:Đoạn mãPORT=5000
GEMINI_API_KEY=your_google_gemini_api_key_here
Start the Backend Server:Bashnode server.js
Server will run at: http://localhost:50003. Setup Frontend (React + Vite)Open a new Terminal window:Bashcd job-radar/frontend
npm install
Start the Frontend Development Server:Bashnpm run dev
React Application will run at: http://localhost:5173⚡ Development Roadmap (9-Day Rapid Sprint)[x] Phase 1 (Aug 5 - Aug 6): Initialized repository, designed Full-Stack REST API architecture & gathered 3 case study datasets.[ ] Phase 2 (Aug 7 - Aug 9): Develop React Components, integrate Tailwind CSS & connect @google/genai SDK (Gemini 2.5 Flash).[ ] Phase 3 (Aug 10 - Aug 11): Implement Dual-Mode Fallback, optimize UI/UX animations & finalize UNESCO-aligned Pitch Deck.[ ] Phase 4 (Aug 12 - Aug 13): Record 3-minute video pitch, perform system QA testing & submit final deliverables ahead of August 14 deadline.📄 License & AcknowledgmentsDeveloped as part of the Youth Media and Information Literacy (MIL) Innovation Initiative.Created by Team JOB RADAR. Licensed under the MIT License.
