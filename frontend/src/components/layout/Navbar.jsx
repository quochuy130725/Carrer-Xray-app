import React from 'react';
import { ShieldAlert, Sparkles, Award, Globe } from 'lucide-react';
import { translations } from '../../locales/translations.js';

const Navbar = ({ lang = 'en', onToggleLang }) => {
  const t = translations[lang] || translations.en;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-6">
          <div className="font-display text-2xl font-bold text-indigo-600 flex items-center gap-2 tracking-tight">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            <span className="hidden sm:inline">{t.appTitle}</span>
            <span className="sm:hidden">JD X-RAY</span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-indigo-50/50 rounded-full border border-indigo-100">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="font-label-sm text-label-sm text-indigo-600 font-medium">{t.appSub || 'GLOBAL MIL EDUCATIONAL EDITION'}</span>
          </div>
        </div>

        {/* Right Controls: MIL Badge & Language Toggle Switcher */}
        <div className="flex items-center gap-4">
          {/* MIL Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200/80 rounded-full px-3.5 py-1.5 text-xs text-slate-700 shadow-sm shadow-slate-200/50">
            <Award className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-indigo-600">MIL STANDARD</span>
            <span className="text-slate-400 hidden lg:inline">| Media & Information Literacy</span>
          </div>

          {/* 🌐 Dynamic Language Toggle Button [ 🌐 EN | VI ] */}
          <div className="bg-slate-100 p-1 rounded-full border border-slate-200 flex items-center gap-1 shadow-sm">
            <button
              onClick={() => onToggleLang && onToggleLang('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                lang === 'en'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> EN
            </button>
            <button
              onClick={() => onToggleLang && onToggleLang('vi')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                lang === 'vi'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              VI
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
