import React from 'react';
import { AlertOctagon, CheckCircle2, AlertTriangle, ShieldCheck, FileSearch } from 'lucide-react';

const DecodeView = ({ job, isDecoding, lang = 'en' }) => {
  if (!isDecoding || !job) return null;

  // Dual-Data: Chọn đúng phiên bản ngôn ngữ
  const redFlags = lang === 'en' ? (job.redFlags_en || job.redFlags || []) : (job.redFlags_vi || job.redFlags || []);
  const marketBenchmark = lang === 'en' ? (job.marketBenchmark_en || job.marketBenchmark || '') : (job.marketBenchmark_vi || job.marketBenchmark || '');
  const isVerified = redFlags.length === 0;

  const isEn = lang === 'en';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden animate-fadeIn">
      {/* Header Banner */}
      <div className={`p-4 border-b flex items-center justify-between ${isVerified
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
        <div className="flex items-center gap-2">
          {isVerified ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertOctagon className="w-5 h-5 text-rose-600 animate-pulse" />
          )}
          <span className="font-extrabold text-sm uppercase tracking-wide">
            {isVerified
              ? (isEn ? '🟢 TRANSPARENT & VERIFIED POST' : '🟢 BÀI ĐĂNG ĐẠT CHUẨN MINH BẠCH')
              : (isEn
                  ? `🚨 ANALYSIS REPORT: ${redFlags.length} RED FLAG${redFlags.length > 1 ? 'S' : ''} DETECTED`
                  : `🚨 BÁO CÁO PHÂN TÍCH: PHÁT HIỆN ${redFlags.length} RED FLAGS`)}
          </span>
        </div>

        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${isVerified
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
            : 'bg-rose-100 text-rose-800 border-rose-300'
          }`}>
          {isVerified
            ? (isEn ? 'Risk: 0%' : 'Rủi ro: 0%')
            : (isEn ? 'Risk Level: HIGH' : 'Mức độ rủi ro: CAO')}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-4">
        {/* Red Flags List */}
        {!isVerified ? (
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
              <FileSearch className="w-4 h-4 text-rose-500" />
              {isEn ? 'Detected Recruitment Traps (Red Flags):' : 'Danh sách bẫy tuyển dụng (Red Flags):'}
            </h4>
            <div className="space-y-2.5">
              {redFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-rose-200 rounded-xl hover:border-rose-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="bg-red-100 text-red-700 underline decoration-red-500 font-semibold text-xs px-2 py-0.5 rounded">
                      "{flag.phrase}"
                    </span>
                    {flag.category && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-rose-500 text-white rounded-full">
                        {flag.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed flex items-start gap-1.5 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{flag.reason}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {isEn ? 'Safe Information Zone' : 'Vùng an toàn thông tin'}
            </div>
            <p className="leading-relaxed">
              {isEn
                ? 'This post is from a verified official entity. CVs are accepted via corporate email domains, with no upfront fees and fully transparent hiring information.'
                : 'Bài đăng từ đơn vị xác thực chính thức. Tiếp nhận CV qua Email tên miền doanh nghiệp chính chủ, không thu phí cọc và minh bạch thông tin tuyển dụng.'}
            </p>
          </div>
        )}

        {/* Market Benchmark Box */}
        {marketBenchmark && (
          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isVerified
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/90 border-amber-200 text-amber-900'
            }`}>
            <div className="flex items-center gap-2 font-bold mb-1.5 text-sm">
              <span>{isEn ? '📊 Market Benchmark & Legal Assessment:' : '📊 Đối chiếu chuẩn thị trường (Market Benchmark):'}</span>
            </div>
            <p>{marketBenchmark}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecodeView;
