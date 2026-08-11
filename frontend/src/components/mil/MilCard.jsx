import React from 'react';
import { Award, Lightbulb, CheckCircle2, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { translations } from '../../locales/translations.js';
import { SpotlightCard } from '../ui/SpotlightCard.jsx';

const MilCard = ({ isTriggered, currentJobId, lang = 'en' }) => {
  const t = translations[lang] || translations.en;

  return (
    <SpotlightCard className="bg-emerald-50 text-emerald-950 p-6 rounded-2xl border-emerald-200/70 shadow-sm interactive-card">
      {/* Header Banner */}
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-emerald-200/50">
        <div className="p-2 bg-emerald-100/50 rounded-lg border border-emerald-200/50 text-emerald-600">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-1">
            {t.unescoCardTitle} <Sparkles className="w-3 h-3 text-emerald-500" />
          </h3>
          <p className="text-[11px] text-emerald-700">Media & Information Literacy</p>
        </div>
      </div>

      {isTriggered ? (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="p-3 mb-3 bg-white/90 border border-emerald-100 text-emerald-950 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-600" /> {t.unescoRuleTitle}
            </div>
            <ul className="text-xs text-emerald-800/90 space-y-1.5 list-disc list-inside leading-relaxed font-body-md">
              <li>{t.unescoRule1}</li>
              <li>{t.unescoRule2}</li>
              <li>{t.unescoRule3}</li>
            </ul>
          </div>

          <div className="p-3 bg-white/90 border border-emerald-100 text-emerald-950 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1.5">
              <Lightbulb className="w-4 h-4 text-emerald-600" /> {lang === 'en' ? 'MIL Skill Recommendation:' : 'Khuyên dùng năng lực MIL:'}
            </div>
            <p className="text-xs text-emerald-800/90 leading-relaxed font-body-md">
              {t.unescoRec}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-xs text-emerald-800/80 space-y-3 font-body-md">
          <div className="flex items-center gap-2 text-emerald-900 font-bold">
            <BookOpen className="w-4 h-4 text-emerald-600" /> {lang === 'en' ? 'Interactive Guide:' : 'Hướng dẫn tương tác:'}
          </div>
          <p className="leading-relaxed text-emerald-900/90">
            {t.unescoMilGuide}
          </p>
          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-950 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>X-Ray the JD. Unmask the trap.</span>
          </div>
        </div>
      )}
    </SpotlightCard>
  );
};

export default React.memo(MilCard);
