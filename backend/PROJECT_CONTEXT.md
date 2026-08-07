# 📡 BACKEND CONTEXT & AI CODING INSTRUCTIONS: CAREER X-RAY

> File này chứa toàn bộ quy chuẩn kiến trúc, tích hợp AI và cơ chế Fallback của **CAREER X-RAY Backend** dành cho AI Coding Assistant (Cursor, Antigravity, Windsurf).

---

## 1. BACKEND OVERVIEW & STACK SPECIFICATION
* **Runtime:** Node.js (>= 18.x)
* **Framework:** Express.js (RESTful API Architecture)
* **AI Core Engine:** Google Gemini 2.5 Flash API (`gemini-2.5-flash`)
* **AI SDK:** Official `@google/genai` SDK
* **Middleware:** `cors`, `express.json()`, `dotenv`
* **Data Layer:** Local JSON File (`data/jobs.json`) serving as Mock DB and Fail-safe Fallback Storage.

---

## 2. PROJECT STRUCTURE
```text
backend/
├── config/                 # Environment Configuration & System Connections
│   ├── db.js               # MongoDB connection setup (Mongoose)
│   └── gemini.js           # Google Gen AI SDK client initialization
│
├── middleware/             # Request/Response Middleware Handlers
│   ├── errorHandler.js     # Centralized error handling middleware
│   └── rateLimiter.js      # API rate limiting & anti-spam (optional)
│
├── routes/                 # API Endpoint Routers
│   └── scanRoutes.js       # Express routes for /api/scan/* endpoints
│
├── controllers/            # HTTP Request & Response Handlers
│   └── scanController.js   # Receives req.body, invokes Services, returns JSON responses
│
├── services/               # Core Business Logic & AI Integrations
│   ├── geminiService.js    # Gemini 2.5 API integration & Prompt Engineering logic
│   └── fallbackService.js  # Fail-safe logic reading jobs.json / MongoDB on failures
│
├── utils/                  # Helper & Utility Functions
│   ├── jsonReader.js       # Safe JSON file reading utility
│   └── logger.js           # Custom console logging utility
│
├── data/
│   └── jobs.json           # Local Fallback Dataset
│
├── .env
├── package.json
└── server.js               # Main Entry Point (Registers Middlewares & Routes)           # Express Server Setup & Middlewares

3. REST API SPECIFICATION
A. GET /api/health
Description: Health check endpoint to verify server status.

Response (200 OK):

JSON
{ "status": "CAREER X-RAY Server Ready" }
B. POST /api/scan/jd
Description: Analyzes raw job description text to detect manipulative terms and Red Flags.

Request Body:

JSON
{
  "jobId": "job-001",
  "jdText": "Tuyển thực tập sinh thu nhập 20 triệu/tháng, đóng phí giữ chỗ 500k..."
}
Success Response (LIVE AI Mode):

JSON
{
  "success": true,
  "mode": "LIVE_AI",
  "data": {
    "redFlags": [
      {
        "phrase": "đóng phí giữ chỗ 500k",
        "reason": "Bẫy lừa cọc tài chính trước khi nhận việc.",
        "category": "Upfront Fee Scam"
      }
    ]
  }
}
C. POST /api/scan/comments
Description: Scans the comment section under a job post to detect Botnet/Seeding behavior.

Request Body:

JSON
{
  "jobId": "job-001",
  "comments": [
    { "id": "c1", "userName": "User A", "text": "Công ty xịn lắm em vừa nhận lương 30tr nè!" }
  ]
}
Success Response (LIVE AI Mode):

JSON
{
  "success": true,
  "mode": "LIVE_AI",
  "data": {
    "comments": [
      {
        "id": "c1",
        "isBot": true,
        "botReason": "Fake Social Proof - Mẫu câu tạo niềm tin giả lập."
      }
    ]
  }
}
4. GEMINI SDK INTEGRATION & STRUCTURED JSON SCHEMAS
When calling @google/genai, ALWAYS enforce structured JSON output using responseMimeType and responseSchema.

Sample SDK Implementation Pattern:
JavaScript
const { GoogleGenAI, Type } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: promptText,
  config: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        redFlags: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phrase: { type: Type.STRING },
              reason: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ['phrase', 'reason']
          }
        }
      }
    }
  }
});
5. FAIL-SAFE FALLBACK MECHANISM (100% UPTIME GUARANTEE)
Backend MUST implement a Dual-Mode Execution model inside scanController.js:

┌────────────────────────────────────────────────────────┐
│                   Incoming Request                     │
└──────────────────────────┬─────────────────────────────┘
                           │
                 Is GEMINI_API_KEY valid?
                /                        \
           [YES]                          [NO]
             │                             │
    Try Gemini 2.5 API Call                │
    (Timeout = 2.5s limit)                 │
        /             \                    │
   (Success)       (Error/Timeout)         │
      │                │                   │
  Return Mode:         └─────────┬─────────┘
  "LIVE_AI"                      │
                                 ▼
                     Read `data/jobs.json`
                                 │
                            Return Mode:
                         "OFFLINE_FALLBACK"
Fallback Rules:
Always wrap external AI API calls inside a try...catch block.

If process.env.GEMINI_API_KEY is missing or default placeholder, immediately trigger Fallback.

If Gemini API throws rate limit (429), connection error, or takes > 2.5s, catch the error and execute getLocalData().

Fallback responses MUST match the exact JSON schema expected by Frontend, returning mode: "OFFLINE_FALLBACK".

6. BACKEND CODING RULES
Do not use complex ORMs or external database drivers; keep all persistence within data/jobs.json.

Keep environment variables strictly in .env (PORT, GEMINI_API_KEY).

Always enable CORS (cors()) to accept cross-origin requests from http://localhost:5173 (Vite Frontend).

Do not crash the Node.js process under any error condition; return structured JSON error messages or Fallback data gracefully.