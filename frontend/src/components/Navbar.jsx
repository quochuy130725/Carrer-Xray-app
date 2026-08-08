import React from 'react';
import { ShieldAlert, Sparkles, Award, Globe } from 'lucide-react';
import { translations } from '../locales/translations.js';

const Navbar = ({ lang = 'en', onToggleLang }) => {
  const t = translations[lang] || translations.en;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 backdrop-blur-md bg-slate-900/90 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-[#ff2a55] flex items-center justify-center shadow-lg shadow-rose-900/40">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                {t.appTitle}
              </h1>
              <span className="bg-rose-500/20 text-[#ff2a55] text-xs font-semibold px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> v1.0 MIL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{t.appSub}</p>
          </div>
        </div>

        {/* Right Controls: UNESCO MIL Badge & Language Toggle Switcher */}
        <div className="flex items-center gap-3">
          {/* UNESCO MIL Badge */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-full px-3.5 py-1.5 text-xs text-slate-300 shadow-inner hidden sm:flex">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-amber-300">UNESCO MIL</span>
            <span className="text-slate-400">| Media & Information Literacy</span>
          </div>

          {/* 🌐 Dynamic Language Toggle Button [ 🌐 EN | VI ] */}
          <div className="bg-slate-800 p-1 rounded-full border border-slate-700 flex items-center gap-1 shadow-md ring-1 ring-slate-700">
            <button
              onClick={() => onToggleLang && onToggleLang('en')}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 ${
                lang === 'en'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> EN
            </button>
            <button
              onClick={() => onToggleLang && onToggleLang('vi')}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                lang === 'vi'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              VI
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
