import React, { useState, useMemo, useCallback } from 'react';
import { Eye, AlertTriangle, CheckCircle2, Info, Building2, Clock, ShieldCheck } from 'lucide-react';
import { translations, translateCategory } from '../../locales/translations.js';
import { motion } from 'framer-motion';
import { SpotlightCard } from '../ui/SpotlightCard.jsx';

const JobCard = ({ job, isDecoding, onToggleDecode, lang = 'en' }) => {
  const t = translations[lang] || translations.en;
  const [activeFlag, setActiveFlag] = useState(null);

  if (!job) {
    return <div className="p-4 text-center text-slate-500">Đang khởi tạo dữ liệu...</div>;
  }

  // Dual-Data: Chọn đúng phiên bản ngôn ngữ và Normalize NFC để fix lỗi Highlight tiếng Việt
  const jdText = useMemo(() => {
    const rawJdText = lang === 'en' ? (job?.jdText_en || job?.jdText || '') : (job?.jdText_vi || job?.jdText || '');
    return typeof rawJdText === 'string' ? rawJdText.normalize("NFC") : rawJdText;
  }, [job, lang]);

  // Display flags: dùng ngôn ngữ hiện tại để HIỂN THỊ
  const redFlags = useMemo(() => {
    const rawFlags = lang === 'en' ? (job?.redFlags_en || job?.redFlags || []) : (job?.redFlags_vi || job?.redFlags || []);
    return rawFlags.filter(f => f && (f.phrase || f.phrase_vi || f.phrase_en || f.reason || f.reason_vi));
  }, [job, lang]);

  // ─── RISK LEVEL: Language-agnostic — dùng TẤT CẢ flags (cả VI + EN) để tính ───
  const allFlags = useMemo(() => {
    const allFlagsVI = (job?.redFlags_vi || job?.redFlags || []).filter(f => f && (f.phrase || f.phrase_vi || f.phrase_en || f.reason || f.reason_vi));
    const allFlagsEN = (job?.redFlags_en || job?.redFlags || []).filter(f => f && (f.phrase || f.phrase_vi || f.phrase_en || f.reason || f.reason_vi));
    return allFlagsVI.length >= allFlagsEN.length ? allFlagsVI : allFlagsEN;
  }, [job]);

  const isSafe = allFlags.length === 0 || job?.riskLevel === 'SAFE' || job?.riskLevel === 'LOW';
  const isVerified = isSafe;

  const severeKeywords = useMemo(() => ['TELEGRAM', '35.115.000', '35M', 'NHIỆM VỤ', 'TASK', 'CỌC', 'DEPOSIT', 'GÕ TRUYỆN'], []);
  
  const isHighRisk = useMemo(() => {
    return !isSafe && (
      job?.riskLevel === 'HIGH' ||
      allFlags.some(f => {
        const txt = `${f.phrase || ''} ${f.phrase_vi || ''} ${f.phrase_en || ''} ${f.reason || ''} ${f.reason_vi || ''} ${f.reason_en || ''} ${f.category || ''}`.toUpperCase();
        return severeKeywords.some(kw => txt.includes(kw));
      })
    );
  }, [isSafe, job?.riskLevel, allFlags, severeKeywords]);

  const currentRiskLevel = isSafe ? 'SAFE' : (isHighRisk ? 'HIGH' : 'MEDIUM');
  const isMedium = currentRiskLevel === 'MEDIUM';

  const handleSetActiveFlag = useCallback((flag, activePhrase) => {
    setActiveFlag(prev => prev?.phrase === activePhrase ? null : flag);
  }, []);

  // Safe Text Highlighting Engine (dùng jdText và redFlags đúng ngôn ngữ)
  const highlightedJD = useMemo(() => {
    try {
      if (!isDecoding || isVerified || !jdText) {
        return <p className="text-slate-800 leading-relaxed whitespace-pre-line font-sans">{jdText}</p>;
      }

      let textParts = [jdText];

      redFlags.forEach((flag, fIdx) => {
        let activePhrase = lang === 'en' ? (flag.phrase_en || flag.phrase) : (flag.phrase_vi || flag.phrase);
        if (!flag || !activePhrase || typeof activePhrase !== 'string') return;

        // Normalize NFC and trim
        activePhrase = activePhrase.normalize("NFC").trim();
        if (activePhrase.length < 2) return;

        const newParts = [];
        textParts.forEach((part, pIdx) => {
          if (typeof part !== 'string') {
            newParts.push(part);
            return;
          }

          const lowerPart = part.toLowerCase();
          const lowerPhrase = activePhrase.toLowerCase();
          const idx = lowerPart.indexOf(lowerPhrase);

          if (idx === -1) {
            newParts.push(part);
          } else {
            const before = part.substring(0, idx);
            const matchedText = part.substring(idx, idx + activePhrase.length);
            const after = part.substring(idx + activePhrase.length);

            if (before) newParts.push(before);

            const highlightClass = isMedium ? "highlight-yellow px-1 rounded" : "highlight-red font-bold px-1 rounded";
            const categoryText = lang === 'en'
              ? (flag.category_en || flag.category || 'CAUTION')
              : (flag.category_vi || translateCategory(flag.category_en || flag.category, 'vi') || 'CẢNH BÁO');
            const reasonText = lang === 'en' ? (flag.reason_en || flag.reason || '') : (flag.reason_vi || flag.reason || '');

            newParts.push(
              <motion.mark
                key={`hl-${fIdx}-${pIdx}-${idx}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 * fIdx }}
                onClick={() => handleSetActiveFlag(flag, activePhrase)}
                className={`relative inline-block cursor-pointer transition-all hover:shadow-sm group mx-0.5 will-change-transform transform-gpu ${highlightClass}`}
              >
                {matchedText}
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 + (0.1 * fIdx) }}
                  className={`inline-flex items-center ml-1 text-[10px] text-white font-extrabold px-1.5 py-0.2 rounded-full will-change-transform transform-gpu ${isMedium ? 'bg-amber-500' : 'bg-rose-500'}`}
                >
                  ⚠️ {categoryText}
                </motion.span>

                {/* Hover Tooltip */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 border border-slate-700 font-normal">
                  <p className={`font-bold mb-1 ${isMedium ? 'text-amber-400' : 'text-rose-400'}`}>🚨 {categoryText}:</p>
                  <p className="text-slate-200 leading-normal">{reasonText}</p>
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
                </span>
              </motion.mark>
            );

            if (after) newParts.push(after);
          }
        });
        textParts = newParts;
      });

      return <div className="text-slate-800 leading-relaxed whitespace-pre-line font-sans">{textParts}</div>;
    } catch (err) {
      console.error("Highlighting error:", err);
      return <p className="text-slate-800 leading-relaxed whitespace-pre-line font-sans">{jdText}</p>;
    }
  }, [isDecoding, isVerified, jdText, redFlags, lang, isMedium, handleSetActiveFlag]);

  return (
    <SpotlightCard className="bg-[#FAF9F5] border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="pb-6 border-b border-slate-200 mt-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 items-start">
            <img
              src={job.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=HR'}
              alt={lang === 'en' ? (job.company_en || job.company) : job.company}
              className="w-14 h-14 rounded-xl border border-slate-200 bg-white object-cover shadow-sm"
            />
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-2 will-change-transform transform-gpu">
                <h2 className="font-display font-bold text-xl text-slate-900 hover:text-indigo-600 transition-colors">
                  {lang === 'en' ? (job.title_en || job.title) : job.title}
                </h2>
                {isDecoding && isVerified && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full inline-block animate-ping bg-emerald-500"></span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {t.transparentBadge}
                  </span>
                )}
              </motion.div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {lang === 'en' ? (job.company_en || job.company) : job.company}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {job.time || (lang === 'en' ? 'Recently posted' : 'Mới đăng')}
                </span>
              </div>
            </div>
          </div>

          {/* DECODE JD Toggle Button */}
          <button
            onClick={onToggleDecode}
            className={`px-5 py-2 rounded-full font-extrabold text-[11px] tracking-wider uppercase shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 flex items-center justify-center whitespace-nowrap cursor-pointer border ${
              isDecoding
                ? 'bg-slate-900 hover:bg-black text-white border-slate-800'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500'
            }`}
          >
            <span>{isDecoding ? `${t.decodeBtn} ACTIVE` : t.decodeBtn}</span>
          </button>
        </div>
      </div>

      {/* JD Body Content */}
      <div className="pt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          {lang === 'en' ? 'Job Description (JD):' : 'Mô tả công việc (JD):'}
        </h3>
        <div className="relative max-h-[500px] overflow-y-auto p-4 bg-white border border-slate-200 rounded-xl text-sm custom-scrollbar">
          {isDecoding && <div className="animate-scan-beam" />}
          {highlightedJD}
        </div>

        {/* Selected Red Flag Detail Box */}
        {isDecoding && activeFlag && (() => {
          const activeFlagPhrase = lang === 'en' ? (activeFlag.phrase_en || activeFlag.phrase) : (activeFlag.phrase_vi || activeFlag.phrase);
          const activeFlagReason = lang === 'en' ? (activeFlag.reason_en || activeFlag.reason) : (activeFlag.reason_vi || activeFlag.reason);
          
          return (
            <div className="mt-4 p-4 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-950 animate-fadeIn">
              <div className="flex items-center gap-2 text-rose-700 font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Red Flag Detail: "{typeof activeFlagPhrase === 'string' ? activeFlagPhrase : JSON.stringify(activeFlagPhrase || '')}"</span>
              </div>
              <p className="text-rose-800 leading-relaxed">{typeof activeFlagReason === 'string' ? activeFlagReason : JSON.stringify(activeFlagReason || '').replace(/^"|"$/g, '')}</p>
            </div>
          );
        })()}

      </div>
    </SpotlightCard>
  );
};

export default React.memo(JobCard);
