# 📡 PROJECT CONTEXT & AI CODING INSTRUCTIONS: CAREER X-RAY

> File này chứa toàn bộ ngữ cảnh, kiến trúc và quy chuẩn lập trình của dự án **CAREER X-RAY** dành cho AI Coding Assistant (Cursor, Antigravity, Windsurf).

---

## 1. PROJECT OVERVIEW
* **Project Name:** CAREER X-RAY
* **Slogan:** *"X-Ray the JD. Unmask the trap."*
* **Domain:** Interactive Web-App Educational Toolkit (Global MIL Educational Edition — Media and Information Literacy).
* **Core Problem:** Help students and fresh graduates detect job scams (upfront fees, fake KPIs, toxic culture) and unmask automated Botnet/Seeding comments under job posts.

---

## 2. TECH STACK SPECIFICATION
* **Frontend:** React.js (Vite), Tailwind CSS, Framer Motion (`framer-motion`), Lucide React Icons (`lucide-react`).
* **Backend:** Node.js, Express.js (RESTful API Architecture).
* **AI Engine:** Google Gemini 2.5 Flash API (`gemini-2.5-flash`) via `@google/genai` SDK.
* **AI Output:** Enforced **Structured JSON** using `responseSchema`.
* **Data Resilience:** Local JSON Mock Database (`backend/data/jobs.json`) for Fail-safe Fallback.

---

## 3. CORE FEATURES & UI STATES

### A. Interactive Job Feed
A simulated social media job board displaying job cards, company info, raw JD text, and a comments section.

### B. [DECODE JD] Mode
* **Trigger:** Click the `[DECODE JD]` button on any Job Card.
* **Behavior:** Highlights dangerous "Red Flag" phrases directly inside the raw text with animated highlight badges.
* **Interaction:** Hovering a highlighted Red Flag displays a Tooltip explaining the warning reason.
* **States:** RED (High Risk), YELLOW (Medium — verification checkpoints), GREEN (Safe/Verified).

### C. [SEEDING X-RAY] Mode
* **Trigger:** Click the `[SEEDING X-RAY]` button.
* **Behavior:** Detects Botnet/Seeding comments in the comment list.
* **Morphing:** Replaces the user's avatar with a Red Robot Icon, adds a subtle red border/background to the comment card, and renders a badge explaining the seeding tactic.

### D. Custom JD Inspector
* Paste raw JD text or drop/paste a screenshot image (`Ctrl+V`) into the Inspector module.
* AI engine (Gemini 2.5 / Regex fallback) returns real-time Red Flag analysis.
* Image support: Base64 encoded multimodal input to Gemini.

### E. MIL Competency Card
Displays "3 KHÔNG" rules & brand verification checkpoints after each case is analyzed.

---

## 4. ARCHITECTURE & FALLBACK MECHANISM (DECOUPLED REST API)

```
[React Frontend] <---> HTTP REST API <---> [Express Backend] <---> [Gemini 2.5 API]
                                                │
                                     (Fallback >2.5s / Error)
                                                │
                                           [jobs.json]
```

### Endpoints
* `GET  /api/health` — Server health check.
* `GET  /api/cases`  — Fetch all curated Case Study categories.
* `POST /api/analyze` — Analyzes raw JD text / image and returns Red Flags + Risk Level.
* `POST /api/scan/jd` — Alias for `/api/analyze`.
* `POST /api/scan/comments` — Scans comment list and returns detected Botnet accounts.

### Fail-safe Strategy (100% Uptime)
If Gemini API fails, times out (>2.5s), or encounters a quota/network error, backend gracefully falls back to reading pre-labeled data from `backend/data/jobs.json` and returns `mode: "OFFLINE_FALLBACK"`.

---

## 5. FRONTEND STRUCTURE (MODULAR ARCHITECTURE)

```text
frontend/src/
├── components/
│   ├── layout/             # Top-level shell & structure
│   │   ├── Navbar.jsx          # Brand Header & Language Toggle (EN/VI)
│   │   └── Sidebar.jsx         # Case Category Accordion & Job Selector
│   │
│   ├── hero/               # Hero section & 3D kinetic elements
│   │   ├── HeroMascot3D.jsx    # Interactive 3D Scanner Bot with particle burst
│   │   ├── Hero3DShield.jsx    # Parallax tilt glassmorphism shield
│   │   └── Hero3DObject.jsx    # Floating 3D ambient object
│   │
│   ├── workspace/          # Core job diagnostic & inspection modules
│   │   ├── JobCard.jsx         # JD Display, scan laser, Red Flag highlighting
│   │   ├── DecodeView.jsx      # Risk badge, flag breakdown, market benchmark
│   │   ├── CustomInspector.jsx # JD paste / image drop module → POST /api/analyze
│   │   └── CommentList.jsx     # Comment section, Botnet Ratio bar, Clone signals
│   │
│   ├── mil/                # Media & Information Literacy components
│   │   └── MilCard.jsx         # MIL Competency Card & "3 KHÔNG" rules
│   │
│   └── ui/                 # Reusable UI primitives & utilities
│       ├── SpotlightCard.jsx   # Mouse-tracking radial glow border wrapper
│       └── ErrorBoundary.jsx   # React crash boundary (white-screen guard)
│
├── locales/
│   └── translations.js     # Bilingual i18n store (EN + VI), keyed by language code
│
├── App.jsx                 # Global State, API Dispatcher & Layout Orchestrator
├── index.css               # Tailwind Directives & custom CSS animations
└── main.jsx                # React Entry Point
```

---

## 6. i18n TRANSLATION KEYS (translations.js)

All user-facing strings are stored in `src/locales/translations.js` under `vi` and `en` namespaces.

Critical keys for AI assistants to know:
- `customInspectorTab` — Label of the Custom Inspector sidebar button
- `decodeBtn` — DECODE JD button label
- `yellowFlagHeader` — Yellow flag section title
- `yellowFlagStatus` — Yellow flag status badge
- `badgeInformal` / `recInformal` — Informal sourcing channel flag labels
- `badgeShift` / `recShift` — Shift schedule flag labels
- `yellowTooltip` — Educational tooltip reminding user Yellow ≠ Scam
- `trustBadge` — Verified enterprise trust badge text

---

## 7. AI CODING RULES
- Write clean, modular, modern React code using React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
- Always ensure UI components are responsive, accessible, and handle loading/error states smoothly.
- Keep logic decoupled between UI components and API calls.
- Do NOT alter the core data schemas without maintaining backwards compatibility with `jobs.json`.
- **STRICT NON-DESTRUCTIVE RULE:** Never modify React state logic, `onPaste` / `onDrop` handlers, `jobsCache`, Unicode NFC normalization, or `Ctrl+V` image paste logic.
- All import paths in `components/` subdirectories must use relative paths (e.g., `../../locales/translations.js`, `../ui/SpotlightCard.jsx`).

---

## 8. RECENT ARCHITECTURAL UPGRADES (v1.3)
* **Modular Frontend Architecture:** `src/components/` restructured into `layout/`, `hero/`, `workspace/`, `mil/`, `ui/` subdirectories.
* **Plainthing Studio Buttons:** CTA buttons redesigned as Solid Dark Pill containers with inline SVG vector badges — no system emojis or AI gradients.
* **Bilingual Yellow Flag Micro-Copy:** Yellow (medium risk) flags now display constructive verification steps instead of alarming scam language.
* **Red Flag Detail Language-Aware Fix:** `activeFlag` detail box in `JobCard.jsx` now resolves `phrase_vi`/`phrase_en` correctly based on active `lang` prop.
* **MIL Trademark Compliance:** All "UNESCO" text labels replaced with generic MIL terminology.
* **Universal Dual-Language Support:** `_vi` and `_en` suffix mapping enforced across all flags, benchmarks, and case study data.
* **Client-Side Caching (`jobsCache`):** Avoids redundant `/api/cases` calls on repeated Case Study navigation.
* **Deterministic Risk Rendering:** `isHighRisk` / `isMedium` computed client-side using `severeKeywords` to override AI anomalies.
* **Unicode NFC Normalization:** `.normalize('NFC')` applied to Vietnamese highlighting to fix cross-platform encoding bugs.