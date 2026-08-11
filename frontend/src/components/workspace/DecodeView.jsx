import React, { useMemo, useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, AlertTriangle, ShieldCheck, FileSearch, AlertCircle, Info } from 'lucide-react';
import { SpotlightCard } from '../ui/SpotlightCard.jsx';
import { translations, translateCategory } from '../../locales/translations.js';

const DecodeView = ({ job, isDecoding, lang = 'en' }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanText, setScanText] = useState("");
  const isEn = lang === 'en';

  useEffect(() => {
    if (isDecoding && job) {
      setIsScanning(true);
      setScanText(isEn ? "Extracting text & images..." : "Đang bóc tách văn bản & hình ảnh...");

      const t1 = setTimeout(() => {
        setScanText(isEn ? "Checking against MIL standards..." : "Đang đối chiếu bộ tiêu chuẩn MIL...");
      }, 800);

      const t2 = setTimeout(() => {
        setScanText(isEn ? "Analyzing and scoring risks..." : "Đang phân tích và chấm điểm rủi ro...");
      }, 1600);

      const t3 = setTimeout(() => {
        setIsScanning(false);
      }, 2600);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [job, isDecoding, isEn]);

  const t = translations[lang] || translations.en;

  const flags = useMemo(() => {
    // Extract active flags array to display (Language-specific)
    const rawFlags = lang === 'en'
      ? (job?.redFlags_en || job?.redFlags || [])
      : (job?.redFlags_vi || job?.redFlags || []);

    // Filter out invalid or empty flags
    return rawFlags.filter(f => f && (f.phrase || f.phrase_vi || f.phrase_en || f.reason || f.reason_vi));
  }, [job, lang]);

  // ─── RISK LEVEL: Language-agnostic — dùng TẤT CẢ flags (cả VI + EN) để tính ───
  const allFlags = useMemo(() => {
    const allFlagsVI = (job?.redFlags_vi || job?.redFlags || []).filter(f => f && (f.phrase || f.phrase_vi || f.phrase_en || f.reason || f.reason_vi));
    const allFlagsEN = (job?.redFlags_en || job?.redFlags || []).filter(f => f && (f.phrase || f.phrase_vi || f.phrase_en || f.reason || f.reason_vi));
    // Dùng mảng nào dài hơn làm chuẩn risk (AI đôi khi trả về nhiều flag hơn ở một ngôn ngữ)
    return allFlagsVI.length >= allFlagsEN.length ? allFlagsVI : allFlagsEN;
  }, [job]);

  // 1. Determine if post is completely safe (Force SAFE if backend marked as SAFE)
  const isSafe = allFlags.length === 0 || job?.riskLevel === 'SAFE' || job?.riskLevel === 'LOW';

  // 2. Determine if post is HIGH risk
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

  // 3. Final risk level assignment
  const currentRiskLevel = isSafe ? 'SAFE' : (isHighRisk ? 'HIGH' : 'MEDIUM');
  const isVerified = isSafe;
  const isMedium = currentRiskLevel === 'MEDIUM';

  // Extract localized benchmark text
  const marketBenchmark = useMemo(() => {
    let bm = lang === 'en' ? (job?.marketBenchmark_en || job?.marketBenchmark) : (job?.marketBenchmark_vi || job?.marketBenchmark);
    if (typeof bm === 'object' && bm !== null) {
      return lang === 'en' ? (bm.text_en || bm.en) : (bm.text_vi || bm.vi);
    }
    return bm || '';
  }, [job, lang]);

  // Trust the backend JSON payload to provide sanitized names
  const targetCompany = useMemo(() => {
    const defaultFallback = lang === 'en' ? "Employer" : "Nhà tuyển dụng";
    if (!job) return defaultFallback;
    
    // Directly fallback through available clean fields
    return job.companyName || job.company || job.title || job.jobTitle || defaultFallback;
  }, [job, lang]);

  // Extract the actual job title, ignoring system generated UI labels
  const targetJobTitle = useMemo(() => {
    const defaultFallback = lang === 'en' ? "similar role" : "công việc tương tự";
    if (!job) return defaultFallback;
    
    const ignoreRegex = /JD X-RAY|System Auto-Scan|AI Image Scan|Kết Quả Quét/i;
    
    let extractedTitle = job.title || job.jobTitle;
    if (extractedTitle && !ignoreRegex.test(extractedTitle)) {
      // Optional: truncate if title is too long
      return extractedTitle.length > 40 ? extractedTitle.substring(0, 40) + "..." : extractedTitle;
    }
    
    return defaultFallback;
  }, [job, lang]);

  const companyPortalUrl = job?.companyPortalUrl || job?.officialPortalUrl || job?.website;

  // ─── Styles by risk level ──────────────────────────────────────────────────
  const headerStyle = isVerified
    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
    : isMedium
      ? 'bg-amber-50/90 border-amber-200 text-amber-950'
      : 'bg-rose-50/90 border-rose-200 text-rose-950';

  const badgeStyle = isVerified
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
    : isMedium
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-rose-100 text-rose-700 border-rose-300';

  const benchmarkStyle = isVerified
    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
    : isMedium
      ? 'bg-amber-50/90 border-amber-200 text-amber-950'
      : 'bg-rose-50/90 border-rose-200 text-rose-950';

  // ─── Header label ──────────────────────────────────────────────────────────
  const headerLabel = isVerified
    ? (isEn ? '🟢 TRANSPARENT & VERIFIED POST' : '🟢 BÀI ĐĂNG ĐẠT CHUẨN MINH BẠCH')
    : isMedium
      ? t.yellowFlagStatus
      : (isEn
        ? `🚨 ANALYSIS REPORT: ${flags.length} RED FLAG${flags.length > 1 ? 'S' : ''} DETECTED`
        : `🚨 BÁO CÁO PHÂN TÍCH: PHÁT HIỆN ${flags.length} RED FLAGS`);

  const badgeLabel = isVerified
    ? (isEn ? 'Risk: 0%' : 'Rủi ro: 0%')
    : isMedium
      ? (isEn ? 'Risk Level: MEDIUM' : 'Mức độ: TRUNG BÌNH')
      : (isEn ? 'Risk Level: HIGH' : 'Mức độ rủi ro: CAO');

  const flagSectionTitle = isMedium
    ? t.yellowFlagHeader
    : (isEn ? 'Detected Recruitment Traps (Red Flags):' : 'Danh sách bẫy tuyển dụng (Red Flags):');

  const flagSectionIcon = isMedium
    ? <AlertCircle className="w-4 h-4 text-amber-500" />
    : <FileSearch className="w-4 h-4 text-rose-600" />;

  const headerIcon = isVerified
    ? <ShieldCheck className="w-5 h-5 text-emerald-600" />
    : isMedium
      ? <AlertCircle className="w-5 h-5 text-amber-500" />
      : <AlertOctagon className="w-5 h-5 text-rose-600 animate-pulse" />;

  if (!isDecoding) return null;
  if (!job) {
    return <div className="p-4 text-center text-slate-500">Đang khởi tạo dữ liệu...</div>;
  }

  return (
    <SpotlightCard className="p-6 bg-white rounded-2xl border-slate-200/90 shadow-sm shadow-slate-200/40 overflow-hidden animate-fadeIn">
      {isScanning ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-indigo-200 animate-fadeIn">
          {/* Pulsing AI Core */}
          <div className="relative flex items-center justify-center w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 bg-indigo-500 rounded-full animate-pulse opacity-20"></div>
            <span className="text-xl">✨</span>
          </div>
          
          {/* Dynamic Text */}
          <h3 className="text-sm font-extrabold text-indigo-900 tracking-wider uppercase mb-2">
            JD X-RAY ENGINE ACTIVE
          </h3>
          <div className="h-6 overflow-hidden">
            <p className="text-sm text-slate-500 font-medium animate-pulse">
              {scanText}
            </p>
          </div>
          
          {/* Progress Bar Track */}
          <div className="w-48 h-1.5 bg-slate-200 rounded-full mt-5 overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full animate-[loading_2.6s_ease-in-out_forwards]"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Header Banner */}
          <div className={`p-6 rounded-2xl border flex items-center justify-between mt-2 ${headerStyle}`}>
        <div className="flex items-center gap-2">
          {headerIcon}
          <span className="font-display font-extrabold text-sm uppercase tracking-wide">
            {headerLabel}
          </span>
        </div>
        <span className={`flex items-center text-xs font-medium px-3 py-1 rounded-full border ${badgeStyle}`}>
          <span className={`w-2.5 h-2.5 rounded-full inline-block mr-2 animate-ping ${isVerified ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
          {badgeLabel}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-4">
        {/* Conditional Rendering Guard */}
        {isSafe ? (
          <div className="p-6 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {isEn ? 'Safe Information Zone' : 'Vùng an toàn thông tin'}
            </div>
            <p className="leading-relaxed">
              {isEn
                ? 'This post contains clear job details, no upfront fees, and transparent hiring information.'
                : 'Tin tuyển dụng minh bạch, rõ ràng về vị trí công việc. Không phát hiện dấu hiệu lừa đảo, thu phí hay liên kết độc hại.'}
            </p>
            <div className="mt-4 p-3 bg-white/60 border border-emerald-100 rounded-xl font-medium text-emerald-800 text-[11px] uppercase tracking-wider shadow-sm flex items-center justify-center text-center">
              {isEn 
                ? '🛡️ VERIFIED SCAN — ALWAYS DOUBLE CHECK THE OFFICIAL COMMUNICATION CHANNEL' 
                : '🛡️ BÀI ĐĂNG AN TOÀN — HÃY LUÔN KIỂM TRA LẠI KÊNH LIÊN HỆ CHÍNH THỨC'}
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-1.5">
              {flagSectionIcon}
              {flagSectionTitle}
            </h4>
            <div className="space-y-2.5">
              {isMedium && (
                <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl mb-4 flex gap-2 items-start">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800/90 leading-relaxed italic">
                    {t.yellowTooltip}
                  </p>
                </div>
              )}
              {flags.map((flag, index) => {
                const phrase = lang === 'en' ? (flag.phrase_en || flag.phrase) : (flag.phrase_vi || flag.phrase);
                let reason = lang === 'en' ? (flag.reason_en || flag.reason) : (flag.reason_vi || flag.reason);
                // Resolve category: prefer explicit lang-specific field, then translate the English key
                let category = lang === 'en'
                  ? (flag.category_en || flag.category || 'CAUTION')
                  : (flag.category_vi || translateCategory(flag.category_en || flag.category, 'vi') || 'CẢNH BÁO');

                if (isMedium) {
                  const catLower = (flag.category_en || flag.category || '').toLowerCase();
                  if (catLower.includes('source') || catLower.includes('informal') || catLower.includes('kênh') || catLower.includes('social')) {
                    category = t.badgeInformal;
                    reason = t.recInformal;
                  } else if (catLower.includes('shift') || catLower.includes('schedule') || catLower.includes('lịch') || catLower.includes('đặc thù')) {
                    category = t.badgeShift;
                    reason = t.recShift;
                  }
                }

                return (
                  <div key={`${phrase}-${index}`} className="p-4 bg-white/90 border border-slate-200/80 rounded-xl shadow-xs">
                    <div className="flex justify-between items-center mb-3">
                      <span className={`font-bold px-3 py-1.5 rounded-xl text-xs ${isHighRisk ? 'text-rose-700 bg-rose-100 border border-rose-300' : 'text-amber-800 bg-amber-100 border border-amber-300'}`}>
                        "{phrase}"
                      </span>
                      <span className={`text-[10px] font-medium uppercase px-3 py-1 rounded-full border ${isHighRisk ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                        {category}
                      </span>
                    </div>
                    {reason && (
                      <p className={`text-xs leading-relaxed flex items-start gap-1.5 mt-1 ${isHighRisk ? 'text-rose-950' : 'text-amber-950'}`}>
                        <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isHighRisk ? 'text-rose-600' : 'text-amber-500'}`} />
                        <span>{reason}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Market Benchmark Box */}
        {marketBenchmark && (
          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${benchmarkStyle}`}>
            <div className="flex items-center gap-2 font-bold mb-1.5 text-sm">
              <span>{isEn ? '📊 Market Benchmark & Legal Assessment:' : '📊 Đối chiếu chuẩn thị trường (Market Benchmark):'}</span>
            </div>
            <p>{typeof marketBenchmark === 'string' ? marketBenchmark : JSON.stringify(marketBenchmark)}</p>
          </div>
        )}

        {/* Safe Alternatives Recommendation (MIL Educational Feature) */}
        {!isSafe && (
          <div className="mt-5 mb-5 p-5 rounded-2xl bg-blue-50/50 border border-blue-200/60 text-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
                  {isEn ? 'Safe Alternatives Recommendation' : 'Góc Định Hướng An Toàn (Safe Alternatives)'}
                </h4>
                <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">
                  {isEn 
                    ? <>Instead of applying via high-risk anonymous posts or personal chats (Zalo/Telegram), we recommend searching for <strong className="text-blue-700">{targetJobTitle}</strong> roles on reputable platforms:</> 
                    : <>Thay vì ứng tuyển qua các bài đăng ẩn danh hoặc nền tảng chat cá nhân (Zalo/Telegram) với rủi ro cao, hệ thống khuyến nghị bạn tìm kiếm vị trí <strong className="text-blue-700">{targetJobTitle}</strong> tại các kênh tuyển dụng chính thống:</>}
                </p>
                
                {/* Platform Suggestions */}
                <div className="flex flex-wrap gap-2.5 mt-3.5">
                  <a 
                    href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(targetJobTitle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:text-blue-600 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="text-[#0A66C2] font-bold">in</span> LinkedIn Jobs
                  </a>
                  
                  <a 
                    href={`https://www.topcv.vn/tim-viec-lam-${encodeURIComponent(targetJobTitle).replace(/%20/g, '-')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="text-emerald-500 font-bold">✔</span> TopCV / VietnamWorks
                  </a>
                </div>
                
                <p className="text-[11px] italic text-slate-500 mt-3">
                  {isEn 
                    ? '*MIL Tip: Always prioritize submitting your CV directly on the company\'s official Career Portal or verified recruiting platforms.' 
                    : '*MIL Tip: Luôn ưu tiên nộp CV trực tiếp trên website (Career Portal) của doanh nghiệp hoặc các nền tảng đã xác minh danh tính nhà tuyển dụng.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </SpotlightCard>
  );
};

export default React.memo(DecodeView);
