# CAREER X-RAY - Design System & UI Specifications (Finalized v1.3)

## 1. Canvas & Typography System
- **App Canvas (`App.jsx`):** Main background uses `bg-[#F8FAFC] min-h-screen text-slate-900 font-sans`.
- **Ambient 3D Floating Orbs:** Blurred background orbs (`indigo-200/30`, `rose-200/20`, `amber-100/30`) with `blur-[100px]`, combined with lightweight glassmorphic 3D background shapes using `backdrop-blur-md` and `animate-float-3d` to create a 3D parallax depth environment without hindering text legibility.
- **Hero Title:** Primary title uses `font-bebas text-5xl sm:text-7xl text-slate-900 tracking-wide uppercase` combined with `.text-stroke-indigo` utility for outline emphasis.
- **Rotating Keyword Animation:** Hero title cycles through `["FUTURE", "REALITY", "SAFETY", "TRAPS"]` keywords via `framer-motion` `AnimatePresence` with `y: 20 → 0` spring transitions.
- **Fonts Linked:** `Bebas Neue` (Display), `Syne` (Accent), and `Plus Jakarta Sans` (Body & UI).

## 2. Layout Grid Architecture
- **Main Container:** Max width constraint using `max-w-[1600px] mx-auto px-4 sm:px-6 py-6 pt-20`.
- **Grid System:** 12-Column Responsive Layout (`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start`).
  - **Left Sidebar (`layout/Sidebar.jsx`):** `lg:col-span-3 min-w-[260px] sticky top-20`.
  - **Center Workspace (`workspace/JobCard.jsx`, `workspace/DecodeView.jsx`, `workspace/CustomInspector.jsx`):** `lg:col-span-6 min-w-0` (CRITICAL: `min-w-0` is strictly enforced to prevent horizontal grid overflow).
  - **Right Sidebar (`mil/MilCard.jsx`):** `lg:col-span-3 min-w-[260px] sticky top-20`.

## 3. Advanced Cinematic Motion & 3D Interactive Hooks
- **Mouse Spotlight Cards (`ui/SpotlightCard.jsx`):** A wrapper component applied to all major interface panels. It calculates exact cursor coordinates `(x, y)` and emits a glowing `radial-gradient(rgba(99, 102, 241, 0.12))` that seamlessly follows the user's mouse along the borders.
- **3D Mascot Bot (`hero/HeroMascot3D.jsx`):** The top-right Hero Banner features an interactive 3D Scanner Bot Mascot. Utilizing `framer-motion`'s `useSpring` and `useMotionValue`, it recalculates `rotateX` and `rotateY` dynamically based on mouse movement. Click emits a particle burst + radar wave effect.
- **Laser Sweep Scan Effect (`workspace/JobCard.jsx`):** Triggers a high-intensity 1.5s vertical sweeping laser (`.animate-scan-beam` with `#6366F1` box-shadow glow) during active job analysis.
- **Spring Physics Flag Badges:** Detected anomaly flags (red/yellow badges) progressively pop out behind the laser sweep using strict spring physics (`type: "spring", stiffness: 260, damping: 20`).
- **Tab & Case Study Transitions:** Case studies switch seamlessly using `<AnimatePresence mode="wait">` fading in and sliding via a 3D tilt scale.

## 4. Semantic Color Palette & Component Fills

### Navigation & Tooltips
- **Sticky Navbar (`layout/Navbar.jsx`):** `fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3`.
- **Evidence Tooltips:** High-contrast floating popups using `bg-slate-900 text-white rounded-xl p-3 text-xs shadow-xl pointer-events-none z-30`.

### Sidebar (`layout/Sidebar.jsx`)
- **Container (Spotlight):** Soft cool grey fill `bg-slate-200/40 border-slate-300/60 rounded-2xl p-4 shadow-xs`.
- **Primary CTA Button (Custom Inspector Trigger):** Plainthing Studio vector pill — `p-1.5 pr-5 rounded-full bg-slate-900 hover:bg-black border border-slate-800`. Includes a circular SVG badge (`w-8 h-8 bg-indigo-500/20`) on the left and a `→` arrow on the right.
- **Active Case Selection:** `bg-indigo-600 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 border-none`. Includes `framer-motion` tactile feedback (`whileHover={{ x: 4, scale: 1.01 }}`, `whileTap={{ scale: 0.98 }}`).

### Custom Inspector (`workspace/CustomInspector.jsx`)
- **Container (Spotlight):** Glassmorphism gradient `bg-gradient-to-br from-indigo-50/90 via-sky-50/50 to-indigo-100/30 border-indigo-200/70 rounded-2xl p-6 shadow-sm`.
- **Input Textarea:** `bg-white/90 border border-indigo-200 text-slate-900 rounded-xl focus:bg-white`.

### Job Reader Workspace (`workspace/JobCard.jsx`)
- **Card Frame (Spotlight):** Warm paper tint `bg-[#FAF9F5] border-slate-200/80 rounded-2xl p-6 shadow-sm`.
- **Inner Scrollable Box:** Text container `max-h-[500px] overflow-y-auto bg-white border border-slate-200 rounded-xl p-4`.
- **DECODE JD Button:** Solid pill — `px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px]`. Toggles to `bg-slate-900` when active.

### Diagnostic Report (`workspace/DecodeView.jsx`)
- **High Risk Alert (RED):** `bg-rose-50/90 border border-rose-200 text-rose-950 rounded-2xl p-6`. Pulsing status dot: `w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block mr-2`.
- **Medium Risk Caution (YELLOW):** `bg-amber-50/90 border border-amber-200 text-amber-950 rounded-2xl p-6`. Includes educational tooltip (`<Info />` icon) reminding that Yellow Flag ≠ Scam.
- **Safe Verified (GREEN):** `bg-emerald-50/90 border border-emerald-200 text-emerald-950 rounded-2xl p-6`. Includes trust badge for verified brands.
- **Anomaly Item Cards:** Detailed flags using `bg-white/90 border border-slate-200/80 rounded-xl p-4 shadow-xs`.

### MIL Competency Card (`mil/MilCard.jsx`)
- **Container (Spotlight):** Educational zone `bg-emerald-50/60 border-emerald-200/70 rounded-2xl p-6 shadow-sm`.
- **Inner Rule Blocks:** `bg-white/90 border border-emerald-100 text-emerald-950 rounded-xl p-3 mb-3`.

## 5. Bilingual i18n Design Rules
- All user-facing text strings MUST be sourced from `src/locales/translations.js` via the `t` alias: `const t = translations[lang] || translations.en`.
- Language toggle `[ EN | VI ]` in Navbar switches `lang` global state instantly with zero layout jumps.
- Flag labels (category badges, reasons) are extracted per-language via `flag.phrase_en || flag.phrase` pattern.
- Yellow flag status and header use `t.yellowFlagStatus` and `t.yellowFlagHeader` respectively.
- Yellow flag items auto-map to constructive badge labels (`t.badgeInformal`, `t.badgeShift`) based on category keyword matching in `DecodeView.jsx`.
