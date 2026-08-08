import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, FolderOpen, Search, Sparkles } from 'lucide-react';
import { translations } from '../locales/translations.js';

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
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 sticky top-20">
      {/* 🚀 Prominent Full-Width Custom JD Inspector Button */}
      <button
        onClick={onOpenCustomInspector}
        className={`w-full p-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm ${viewMode === 'CUSTOM_INPUT' || isCustomResult
            ? 'bg-gradient-to-r from-rose-600 to-[#ff2a55] text-white shadow-rose-500/30 ring-2 ring-rose-300 scale-[1.02]'
            : 'bg-rose-50 text-[#ff2a55] border border-rose-200 hover:bg-rose-100 hover:shadow'
          }`}
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{t.customInspectorTab}</span>
        <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
      </button>

      {/* Case Studies Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <FolderOpen className="w-3.5 h-3.5 text-rose-500" /> {t.libraryTitle}
        </h3>
        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
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
              className={`rounded-xl border transition-all overflow-hidden ${hasActiveJob
                  ? 'border-rose-300 bg-rose-50/30'
                  : 'border-slate-200/80 bg-slate-50/50'
                }`}
            >
              {/* Category Level 1 Header */}
              <button
                onClick={() => toggleExpandCase(cat.caseId)}
                className="w-full p-2.5 flex items-center justify-between text-left font-bold text-xs text-slate-800 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="truncate">{lang === 'en' ? (cat.caseTitle_en || cat.caseTitle) : cat.caseTitle}</span>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 flex-shrink-0">
                  {cat.jobs?.length || 0}
                </span>
              </button>

              {/* Sub-list Level 2 (Job Posts under Category) */}
              {isExpanded && cat.jobs && (
                <div className="px-2 pb-2 pt-0.5 space-y-1 border-t border-slate-100/60 bg-white">
                  {cat.jobs.map((job) => {
                    // Không bôi đỏ job item nào khi đang hiển thị Custom JD result
                    const isSelected = !isCustomResult && viewMode === 'VIEW' && selectedJobId === job.id;

                    return (
                      <button
                        key={job.id}
                        onClick={() => onSelectJob(job.id)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all flex items-start gap-2 ${isSelected
                            ? 'bg-[#ff2a55] text-white font-bold shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                          }`}
                      >
                        <FileText className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'
                          }`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate leading-snug">
                            {lang === 'en' ? (job.title_en || job.title) : job.title}
                          </p>
                          <p className={`text-[10px] truncate ${isSelected ? 'text-rose-100' : 'text-slate-400'
                            }`}>
                            {lang === 'en' ? (job.company_en || job.company) : job.company}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
