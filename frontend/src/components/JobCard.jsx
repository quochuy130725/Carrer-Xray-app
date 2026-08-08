import React, { useState } from 'react';
import { Eye, AlertTriangle, CheckCircle2, Info, Building2, Clock, ShieldCheck } from 'lucide-react';
import { translations } from '../locales/translations.js';

const JobCard = ({ job, isDecoding, onToggleDecode, lang = 'en' }) => {
  const t = translations[lang] || translations.en;
  const [activeFlag, setActiveFlag] = useState(null);

  if (!job) return null;

  // Dual-Data: Chọn đúng phiên bản ngôn ngữ
  const jdText = lang === 'en' ? (job.jdText_en || job.jdText || '') : (job.jdText_vi || job.jdText || '');
  const redFlags = lang === 'en' ? (job.redFlags_en || job.redFlags || []) : (job.redFlags_vi || job.redFlags || []);
  const marketBenchmark = lang === 'en' ? (job.marketBenchmark_en || job.marketBenchmark || '') : (job.marketBenchmark_vi || job.marketBenchmark || '');
  const isVerified = redFlags.length === 0;

  // Safe Text Highlighting Engine (dùng jdText và redFlags đúng ngôn ngữ)
  const renderHighlightedJD = () => {
    if (!isDecoding || isVerified || !jdText) {
      return <p className="text-slate-700 leading-relaxed whitespace-pre-line font-normal">{jdText}</p>;
    }

    let textParts = [jdText];

    redFlags.forEach((flag) => {
      if (!flag || !flag.phrase || typeof flag.phrase !== 'string') return;

      const newParts = [];
      textParts.forEach((part) => {
        if (typeof part !== 'string') {
          newParts.push(part);
          return;
        }

        const lowerPart = part.toLowerCase();
        const lowerPhrase = flag.phrase.toLowerCase();
        const idx = lowerPart.indexOf(lowerPhrase);

        if (idx === -1) {
          newParts.push(part);
        } else {
          const before = part.substring(0, idx);
          const matchedText = part.substring(idx, idx + flag.phrase.length);
          const after = part.substring(idx + flag.phrase.length);

          if (before) newParts.push(before);

          newParts.push(
            <span
              key={`${flag.phrase}-${idx}-${Math.random()}`}
              onClick={() => setActiveFlag(activeFlag?.phrase === flag.phrase ? null : flag)}
              className="relative inline-block bg-red-100 text-red-700 underline decoration-red-500 font-semibold cursor-pointer px-1 py-0.5 rounded transition-all hover:bg-red-200 hover:shadow-sm group mx-0.5"
            >
              {matchedText}
              <span className="inline-flex items-center ml-1 text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                ⚠️ {flag.category || 'Red Flag'}
              </span>

              {/* Hover Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 border border-slate-700">
                <p className="font-bold text-[#ff2a55] mb-1">🚨 {flag.category || 'Red Flag Warning'}:</p>
                <p className="text-slate-300 leading-normal">{flag.reason}</p>
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
              </span>
            </span>
          );

          if (after) newParts.push(after);
        }
      });
      textParts = newParts;
    });

    return <div className="text-slate-700 leading-relaxed whitespace-pre-line font-normal">{textParts}</div>;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Card Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 items-start">
            <img
              src={job.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=HR'}
              alt={lang === 'en' ? (job.company_en || job.company) : job.company}
              className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-100 object-cover shadow-sm"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-lg text-slate-900 hover:text-rose-600 transition-colors">
                  {lang === 'en' ? (job.title_en || job.title) : job.title}
                </h2>
                {isDecoding && isVerified && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {t.transparentBadge}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {lang === 'en' ? (job.company_en || job.company) : job.company}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {job.time || (lang === 'en' ? 'Recently posted' : 'Mới đăng')}
                </span>
              </div>
            </div>
          </div>

          {/* DECODE JD Toggle Button */}
          <button
            onClick={onToggleDecode}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-sm ${isDecoding
              ? 'bg-[#ff2a55] text-white shadow-rose-500/30 ring-2 ring-rose-300 animate-pulse'
              : 'bg-rose-50 text-[#ff2a55] border border-rose-200 hover:bg-rose-100'
              }`}
          >
            <Eye className="w-4 h-4" />
            {isDecoding ? `[${t.decodeBtn} ACTIVE]` : `[${t.decodeBtn}]`}
          </button>
        </div>
      </div>

      {/* JD Body Content */}
      <div className="p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {lang === 'en' ? 'Job Description (JD):' : 'Mô tả công việc (JD):'}
        </h3>
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-sm">
          {renderHighlightedJD()}
        </div>

        {/* Selected Red Flag Detail Box */}
        {activeFlag && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-slate-800 animate-fadeIn">
            <div className="flex items-center gap-2 text-[#ff2a55] font-bold mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Red Flag Detail: "{activeFlag.phrase}"</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{activeFlag.reason}</p>
          </div>
        )}

        {/* Market Benchmark Box */}
        {isDecoding && marketBenchmark && (
          <div className={`mt-5 p-4 rounded-xl border text-xs flex gap-3 items-start animate-fadeIn ${isVerified
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/90 border-amber-200 text-amber-900'
            }`}>
            {isVerified ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold mb-1">
                {isVerified ? `🟢 ${t.transparentBadge}:` : `📊 ${t.marketBenchmarkTitle}:`}
              </p>
              <p className="leading-relaxed">{marketBenchmark}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
