import React, { useState } from 'react';
import { Eye, AlertTriangle, CheckCircle, Info, Building2, Clock } from 'lucide-react';

const JobCard = ({ job, isDecoding, onToggleDecode }) => {
  const [activeFlag, setActiveFlag] = useState(null);

  if (!job) return null;

  // Function to highlight red flags in JD text when DECODE mode is active
  const renderHighlightedJD = () => {
    if (!isDecoding || !job.redFlags || job.redFlags.length === 0) {
      return <p className="text-slate-700 leading-relaxed whitespace-pre-line">{job.jdText}</p>;
    }

    let textParts = [job.jdText];

    // Replace phrase matches with JSX elements
    job.redFlags.forEach((flag) => {
      const newParts = [];
      textParts.forEach((part) => {
        if (typeof part !== 'string') {
          newParts.push(part);
          return;
        }

        const index = part.indexOf(flag.phrase);
        if (index === -1) {
          newParts.push(part);
        } else {
          const before = part.substring(0, index);
          const after = part.substring(index + flag.phrase.length);
          if (before) newParts.push(before);

          newParts.push(
            <span
              key={`${flag.phrase}-${index}`}
              onClick={() => setActiveFlag(activeFlag?.phrase === flag.phrase ? null : flag)}
              className="relative inline-block bg-[#ff2a55] text-white font-semibold px-1.5 py-0.5 rounded cursor-pointer transition-all hover:scale-105 hover:shadow-md hover:ring-2 hover:ring-rose-400 group mx-0.5"
            >
              {flag.phrase}
              <span className="inline-flex items-center ml-1 text-xs bg-white/20 px-1 rounded">
                ⚠️ {flag.category || 'Red Flag'}
              </span>

              {/* Tooltip on Hover */}
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

    return <div className="text-slate-700 leading-relaxed whitespace-pre-line">{textParts}</div>;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Card Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 items-start">
            <img
              src={job.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=HR'}
              alt={job.company}
              className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-100 object-cover shadow-sm"
            />
            <div>
              <h2 className="font-bold text-lg text-slate-900 hover:text-rose-600 transition-colors">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {job.company}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {job.time || 'Mới đăng'}
                </span>
              </div>
            </div>
          </div>

          {/* DECODE JD Button */}
          <button
            onClick={onToggleDecode}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-sm ${
              isDecoding
                ? 'bg-[#ff2a55] text-white shadow-rose-500/30 ring-2 ring-rose-300 animate-pulse'
                : 'bg-rose-50 text-[#ff2a55] border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Eye className="w-4 h-4" />
            {isDecoding ? '[DECODE JD ACTIVE]' : '[DECODE JD]'}
          </button>
        </div>
      </div>

      {/* JD Body Content */}
      <div className="p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Mô tả công việc (JD):</h3>
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-sm">
          {renderHighlightedJD()}
        </div>

        {/* Selected Red Flag Info Banner */}
        {activeFlag && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-slate-800 animate-fadeIn">
            <div className="flex items-center gap-2 text-[#ff2a55] font-bold mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Phân tích Red Flag: "{activeFlag.phrase}"</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{activeFlag.reason}</p>
          </div>
        )}

        {/* Market Benchmark Box when Decode is active */}
        {isDecoding && job.marketBenchmark && (
          <div className="mt-5 p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-slate-800 flex gap-3 items-start animate-fadeIn">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 mb-1">📊 Đối chiếu chuẩn thị trường (Market Benchmark):</p>
              <p className="text-amber-800 leading-relaxed">{job.marketBenchmark}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
