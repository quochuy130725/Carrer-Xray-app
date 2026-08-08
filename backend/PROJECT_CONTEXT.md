# 📡 BACKEND CONTEXT & AI CODING INSTRUCTIONS: CAREER X-RAY

> File này chứa toàn bộ quy chuẩn kiến trúc, mạch xử lý API & Database, Engine bóc tách Red Flags, ghi nhận Audit Log và cơ chế Fallback của **CAREER X-RAY Backend** dành cho AI Coding Assistant (Cursor, Antigravity, Windsurf).

---

## 1. BACKEND OVERVIEW & STACK SPECIFICATION

* **Runtime:** Node.js (>= 18.x)
* **Framework:** Express.js (RESTful API Architecture)
* **AI Core Engine:** Google Gemini 2.5 Flash API (`gemini-2.5-flash`) + Custom Regex Pattern Matching Engine
* **AI SDK:** Official `@google/genai` SDK
* **Database & Persistence:** MongoDB Atlas (Mongoose ORM) + Local JSON (`data/jobs.json`) làm lớp dự phòng (Fail-safe Fallback).
* **Collections:**
  - `jobs`: Lưu giữ các Case Studies mẫu được xác thực và gán nhãn chuyên sâu.
  - `scanned_jobs`: Lưu giữ Audit Log các bài đăng tùy chỉnh do người dùng gửi phân tích qua module Inspector.
* **Middleware:** `cors`, `express.json()`, `dotenv`, `errorHandler`

---

## 2. PROJECT STRUCTURE

```text
backend/
├── config/                 # Environment Configuration & System Connections
│   ├── db.js               # MongoDB Atlas connection setup (Mongoose)
│   └── gemini.js           # Google Gen AI SDK client & helper config
│
├── middleware/             # Request/Response Middleware Handlers
│   ├── errorHandler.js     # Centralized error handling middleware
│   └── rateLimiter.js      # API rate limiting & anti-spam middleware
│
├── routes/                 # API Endpoint Routers
│   └── scanRoutes.js       # Express routes (/api/cases, /api/analyze, /api/scan/*)
│
├── controllers/            # HTTP Request & Response Handlers
│   └── scanController.js   # Receives req.body, invokes Services, handles audit logging
│
├── services/               # Core Business Logic & AI Integrations
│   ├── geminiService.js    # Gemini 2.5 API integration & Prompt Engineering logic
│   ├── regexService.js     # Pattern matching detection engine (Upfront fees, Telegram, Zalo)
│   └── fallbackService.js  # Fail-safe fallback logic reading jobs.json / MongoDB
│
├── utils/                  # Helper & Utility Functions
│   ├── jsonReader.js       # Safe JSON file reading helper
│   └── logger.js           # Custom logger utility
│
├── models/                 # Mongoose Data Schemas
│   ├── Job.js              # Job, RedFlag & Comment Mongoose Schema
│   └── ScannedJob.js       # Audit Log Schema for /api/analyze queries
│
├── scripts/                # Database Utilities & Automation
│   └── seed.js             # Automated dataset seeder (npm run seed)
│
├── data/
│   └── jobs.json           # Local Nested Fallback Dataset (Case Studies & Job Posts)
│
├── .env                    # Environment variables (PORT, GEMINI_API_KEY, MONGO_URI)
├── package.json            # Dependencies & Scripts (start, dev, seed)
└── server.js               # Main Entry Point (Registers Middlewares, Routes & DB Connection)
```

---

## 3. MẠCH XỬ LÝ API VÀ DATABASE CHI TIẾT

### 🔄 1. Mạch Xử Lý `GET /api/cases` (Lấy dữ liệu Case Studies từ MongoDB Atlas)

```text
[ CLIENT (REACT) ] ──────► GET /api/cases ──────► [ EXPRESS ROUTER ]
                                                           │
                                                           ▼
                                                [ scanController.getCases ]
                                                           │
                                      ┌────────────────────┴────────────────────┐
                                      │                                         │
                             [ MONGO ATLAS CONNECTED? ]                 [ OFFLINE / FALLBACK ]
                                      │                                         │
                                   (YES)                                      (NO)
                                      ▼                                         ▼
                            `Job.find({}).lean()`                      Read `data/jobs.json`
                                      │                                         │
                                      └────────────────────┬────────────────────┘
                                                           │
                                                           ▼
                                                Group into 5 Case Categories
                                                           │
                                                           ▼
                                               [ Return 200 JSON Response ]
```

- **Mục đích:** Cung cấp cho ứng dụng danh sách 5 nhóm Case Studies bài đăng mẫu đã qua xác thực (Bẫy lừa cọc, Bóc lột Multi-Task, JD chuẩn minh bạch, Dàn Botnet Seeding, Bẫy nhiệm vụ Telegram).
- **Mạch dữ liệu (Data Pipeline):**
  1. Frontend khởi tạo ứng dụng ➔ Gửi yêu cầu `GET /api/cases` (hoặc `/api/jobs`).
  2. Controller `getCases` kiểm tra trạng thái MongoDB Atlas. Nếu khả dụng, thực hiện `Job.find({}).lean()` để truy vấn dữ liệu từ collection `jobs`.
  3. Nếu kết nối MongoDB gián đoạn, tự động chuyển sang đọc file cục bộ `data/jobs.json` để đảm bảo 100% Uptime.
  4. Trả về mảng JSON lồng cấu trúc nhóm Cấp 1 (`caseTitle`, `caseBadge`) & Cấp 2 (`jobs`).

---

### 🔍 2. Mạch Xử Lý `POST /api/analyze` (Engine nhận `jdText`, Bóc tách Red Flags & Ghi Audit Log)

```text
[ CLIENT (REACT) ] ──► POST /api/analyze { jdText } ──► [ EXPRESS ROUTER ]
                                                                │
                                                                ▼
                                                   [ scanController.analyzeJD ]
                                                                │
                                              ┌─────────────────┴─────────────────┐
                                              ▼                                   ▼
                                   [ REGEX DETECTION ENGINE ]           [ GEMINI 2.5 AI ENGINE ]
                                  (Pattern match: cọc, Zalo,          (Structured JSON extraction:
                                   Telegram, phí thiết bị)             redFlags & marketBenchmark)
                                              │                                   │
                                              └─────────────────┬─────────────────┘
                                                                │
                                                                ▼
                                                [ MERGE & ASSESS RISK SEVERITY ]
                                                                │
                                                                ▼
                                               [ AUDIT LOG PERSISTENCE (MONGO ATLAS) ]
                                               Save to collection `scanned_jobs`:
                                               { rawJdText, redFlags, riskScore, createdAt }
                                                                │
                                                                ▼
                                                  [ Return Real-Time JSON Stream ]
```

- **Mục đích:** Nhận văn bản JD tùy chỉnh từ ô `[ 🔍 CUSTOM JD INSPECTOR ]` do người dùng dán vào, tự động bóc tách các dấu hiệu rủi ro và lưu lại nhật ký phân tích (Audit Log).
- **Mạch xử lý từng bước (Step-by-Step Pipeline):**
  1. **Nhận Input:** Controller tiếp nhận payload `{ jdText: "..." }` từ client.
  2. **Regex Rule Engine (`regexService.js`):** Chạy các biểu thức chính quy quét qua văn bản để phát hiện lập tức các cụm từ rủi ro cao (chuyển tiền, đặt cọc 500k, Zalo cá nhân, tuyển rạp phim, cắt mác gia công tại nhà, phí kích hoạt tài khoản Telegram).
  3. **Gemini AI Engine (`geminiService.js`):** Gọi Gemini 2.5 Flash API với Structured JSON Schema để trích xuất danh sách `redFlags` (`phrase`, `reason`, `category`) và `marketBenchmark` chuyên sâu.
  4. **Ghi nhận Audit Log (MongoDB Atlas `scanned_jobs`):** Tạo tài liệu mới trong collection `scanned_jobs` lưu vết:
     - `rawJdText`: Văn bản nguyên bản người dùng dán vào.
     - `detectedRedFlags`: Danh sách Red Flags phát hiện được.
     - `riskSeverity`: Đánh giá rủi ro (RED_FLAG / WARNING / SAFE).
     - `createdAt`: Thời gian tạo audit.
  5. **Trả kết quả Real-time:** Trả về kết quả JSON với đầy đủ Red Flags để Frontend highlight giao diện.

---

## 4. GEMINI SDK INTEGRATION & STRUCTURED JSON SCHEMAS

When calling `@google/genai`, ALWAYS enforce structured JSON output using `responseMimeType` and `responseSchema`.

```javascript
const { ai, Type, GEMINI_MODEL } = require('../config/gemini');

const response = await ai.models.generateContent({
  model: GEMINI_MODEL,
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
        },
        marketBenchmark: { type: Type.STRING }
      }
    }
  }
});
```

---

## 5. FAIL-SAFE FALLBACK MECHANISM (100% UPTIME GUARANTEE)

Backend triển khai mô hình Dual-Mode Execution giúp hệ thống hoạt động ổn định 100%:

```text
┌────────────────────────────────────────────────────────┐
│                   Incoming Request                     │
└──────────────────────────┬─────────────────────────────┘
                           │
                Is GEMINI_API_KEY valid?
                /                        \
           [YES]                          [NO]
             │                             │
    Try Gemini 2.5 API Call                │
    (Timeout / Quota check)                │
        /             \                    │
   (Success)       (Error/Timeout)         │
      │                │                   │
  Return Mode:         └─────────┬─────────┘
  "LIVE_AI"                      │
                                 ▼
                   Read `data/jobs.json` / MongoDB
                                 │
                            Return Mode:
                         "OFFLINE_FALLBACK"
```

---

## 6. BACKEND CODING RULES

- Tuân thủ nghiêm ngặt kiến trúc MVC phân tầng (`config/`, `controllers/`, `services/`, `models/`, `routes/`, `utils/`).
- Quản lý biến môi trường trong `.env` (`PORT`, `GEMINI_API_KEY`, `MONGO_URI`).
- Luôn bật `cors()` cho phép Frontend kết nối từ `http://localhost:5173`.
- Ghi nhật ký lỗi bằng `logger` thay vì `console.log` thuần.