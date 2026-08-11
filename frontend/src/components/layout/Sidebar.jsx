import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, FolderOpen, Search, Sparkles } from 'lucide-react';
import { translations } from '../../locales/translations.js';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from '../ui/SpotlightCard.jsx';

const Sidebar = ({ cases = [], selectedJobId, onSelectJob, onOpenCustomInspector, viewMode = 'VIEW', isCustomResult = false, lang = 'en' }) => {
  const t = translations[lang] || translations.en;
  const [expandedCaseIds, setExpandedCaseIds] = useState(['case-1', 'case-2', 'case-3', 'case-4', 'case-5']);

  const toggleExpandCase = (caseId) => {
    setExpandedCaseIds((prev) =>
      prev.includes(caseId) ? prev.filter((id) => id !== caseId) : [...prev, caseId]
    );
  };

  const totalPosts = cases.reduce((acc, c) => acc + (c.jobs?.length || 0), 0);

  return (
    <SpotlightCard className="bg-slate-200/40 border-slate-300/60 rounded-2xl p-4 shadow-xs flex flex-col h-[calc(100vh-100px)]">
      {/* 🚀 High-End Vector Custom JD Inspector Button */}
      <button
        onClick={onOpenCustomInspector}
        className={`w-full mb-5 p-1.5 pr-5 rounded-full text-white font-extrabold text-xs uppercase tracking-wider shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-between group cursor-pointer border ${
          viewMode === 'CUSTOM_INPUT' || isCustomResult
            ? 'bg-indigo-600 border-indigo-500'
            : 'bg-slate-900 hover:bg-black border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Clean Vector Badge */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            viewMode === 'CUSTOM_INPUT' || isCustomResult
              ? 'bg-white/20 text-white'
              : 'bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'
          }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="truncate">{t.customInspectorTab}</span>
        </div>
        <span className="text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all">→</span>
      </button>

      {/* Case Studies Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <FolderOpen className="w-3.5 h-3.5 text-slate-400" /> {t.libraryTitle}
        </h3>
        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
          {totalPosts} {t.postsCount}
        </span>
      </div>

      {/* Case Categories Accordion List */}
      <div className="space-y-2">
        {cases.map((cat) => {
          const isExpanded = expandedCaseIds.includes(cat.caseId);
          // Không bôi đỏ Case nào khi đang hiển thị Custom JD result
          const hasActiveJob = !isCustomResult && viewMode === 'VIEW' && cat.jobs?.some((j) => j.id === selectedJobId);

          return (
            <div
              key={cat.caseId}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden mb-3 shadow-sm hover:shadow-md ${hasActiveJob
                  ? 'border-indigo-300/80 bg-gradient-to-b from-indigo-50/50 to-white'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
            >
              {/* Category Level 1 Header */}
              <button
                onClick={() => toggleExpandCase(cat.caseId)}
                className="w-full p-3 flex items-center justify-between text-left transition-colors hover:bg-slate-50/80"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className={`p-1 rounded-lg ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className={`line-clamp-2 text-sm leading-snug font-bold ${hasActiveJob ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {lang === 'en' ? (cat.caseTitle_en || cat.caseTitle) : cat.caseTitle}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 flex-shrink-0 border border-slate-200/60 shadow-xs">
                  {cat.jobs?.length || 0}
                </span>
              </button>

              {/* Sub-list Level 2 (Job Posts under Category) */}
              <AnimatePresence>
                {isExpanded && cat.jobs && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-2 pb-2 overflow-hidden"
                  >
                    <div className="space-y-1.5 pt-1 border-t border-slate-100">
                      {cat.jobs.map((job) => {
                        // Không bôi đỏ job item nào khi đang hiển thị Custom JD result
                        const isSelected = !isCustomResult && viewMode === 'VIEW' && selectedJobId === job.id;

                        return (
                          <motion.button
                            key={job.id}
                            onClick={() => onSelectJob(job.id)}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] transition-all duration-200 flex items-start gap-3 border ${isSelected
                                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200/50 border-indigo-600'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300 border-slate-200/60 font-medium'
                              }`}
                          >
                            <FileText className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`} />
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 leading-snug">
                                {lang === 'en' ? (job.title_en || job.title) : job.title}
                              </p>
                              <p className={`text-[10px] truncate mt-1 font-bold ${isSelected ? 'text-indigo-100' : 'text-slate-400'
                                }`}>
                                {lang === 'en' ? (job.company_en || job.company) : job.company}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </SpotlightCard>
  );
};

export default React.memo(Sidebar);
