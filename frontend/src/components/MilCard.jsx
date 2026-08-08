import React from 'react';
import { Award, Lightbulb, CheckCircle2, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { translations } from '../locales/translations.js';

const MilCard = ({ isTriggered, currentJobId, lang = 'en' }) => {
  const t = translations[lang] || translations.en;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-2xl border border-slate-700/80 shadow-xl sticky top-20">
      {/* Header Banner */}
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-700/60">
        <div className="p-2 bg-amber-400/10 rounded-xl border border-amber-400/20 text-amber-400">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-amber-300 flex items-center gap-1">
            {t.unescoCardTitle} <Sparkles className="w-3 h-3 text-amber-400" />
          </h3>
          <p className="text-[11px] text-slate-400">Media & Information Literacy</p>
        </div>
      </div>

      {isTriggered ? (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-[#ff2a55] font-bold text-xs mb-1.5">
              <ShieldAlert className="w-4 h-4" /> {t.unescoRuleTitle}
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed font-normal">
              <li>{t.unescoRule1}</li>
              <li>{t.unescoRule2}</li>
              <li>{t.unescoRule3}</li>
            </ul>
          </div>

          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1.5">
              <Lightbulb className="w-4 h-4" /> {lang === 'en' ? 'MIL Skill Recommendation:' : 'Khuyên dùng năng lực MIL:'}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {t.unescoRec}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <BookOpen className="w-4 h-4 text-sky-400" /> {lang === 'en' ? 'Interactive Guide:' : 'Hướng dẫn tương tác:'}
          </div>
          <p className="leading-relaxed font-normal text-slate-300">
            {t.unescoMilGuide}
          </p>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 flex items-center gap-2 text-slate-300 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>X-Ray the JD. Unmask the trap.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilCard;
