import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Navbar from './components/layout/Navbar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import JobCard from './components/workspace/JobCard.jsx';
import DecodeView from './components/workspace/DecodeView.jsx';
import CommentList from './components/workspace/CommentList.jsx';
import MilCard from './components/mil/MilCard.jsx';
import CustomInspector from './components/workspace/CustomInspector.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { translations } from './locales/translations.js';
import { motion, AnimatePresence } from 'framer-motion';
import HeroMascot3D from './components/hero/HeroMascot3D.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  // Global Language State (Default 'en' for MIL international evaluation)
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('career_xray_lang') || 'en';
  });

  const t = translations[lang] || translations.en;

  // View Mode State: 'VIEW' (Main Feed Decoder) | 'CUSTOM_INPUT' (Standalone Inspector Form)
  const [viewMode, setViewMode] = useState('VIEW');
  const inspectorRef = useRef(null);

  useEffect(() => {
    if (viewMode === 'CUSTOM_INPUT') {
      const timer = setTimeout(() => {
        inspectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode]);

  const [caseCategories, setCaseCategories] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('job-001');
  const [jobData, setJobData] = useState(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(false);
  // Flag ngăn useEffect overwrite jobData khi vừa phân tích custom JD xong
  const [isCustomResult, setIsCustomResult] = useState(false);

  // Animated Hero Keywords
  const keywords = ["FUTURE", "REALITY", "SAFETY", "TRAPS"];
  const [keywordIndex, setKeywordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setKeywordIndex((prev) => (prev + 1) % keywords.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // 1. Fetch Case Categories dynamically from Backend API (MongoDB Atlas Primary)
  useEffect(() => {
    let isMounted = true;
    setInitialLoading(true);

    fetch(`${API_URL}/api/scan/cases`)
      .then((res) => res.json())
      .then((res) => {
        if (!isMounted) return;
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setCaseCategories(res.data);

          // Tự động gán bài đăng đầu tiên làm mặc định nếu chưa chọn
          const firstCat = res.data[0];
          const firstJob = (firstCat.jobs && firstCat.jobs.length > 0) ? firstCat.jobs[0] : firstCat;
          if (firstJob && (firstJob.id || firstJob.jobId)) {
            setSelectedJobId(firstJob.id || firstJob.jobId);
          }
        }
      })
      .catch((err) => {
        console.warn('Unable to fetch cases from backend API:', err.message);
      })
      .finally(() => {
        if (isMounted) setInitialLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Extract all jobs into a flat list dynamically
  const allJobsFlat = useMemo(() => {
    const flatList = [];
    if (Array.isArray(caseCategories)) {
      caseCategories.forEach((cat) => {
        if (cat.jobs && Array.isArray(cat.jobs)) {
          cat.jobs.forEach((j) => flatList.push(j));
        } else {
          flatList.push(cat);
        }
      });
    }
    return flatList;
  }, [caseCategories]);

  // Active job item calculation with dynamic fallback
  const activeFallbackJob = useMemo(() => {
    return allJobsFlat.find((j) => j.id === selectedJobId || j.jobId === selectedJobId) || allJobsFlat[0];
  }, [selectedJobId, allJobsFlat]);

  // Cache cho các bài đăng case studies đã tải
  const [jobsCache, setJobsCache] = useState({});

  // 3. Fetch detailed job data for selected post (bỏ qua khi đang hiển thị kết quả Custom Inspector)
  useEffect(() => {
    if (!selectedJobId || viewMode !== 'VIEW') return;
    // Quan trọng: Không fetch lại nếu vừa switch về VIEW từ custom analysis
    if (isCustomResult) return;

    // Kiểm tra cache trước khi call API
    if (jobsCache[selectedJobId]) {
      console.log(`[Cache Hit] Loading case study ${selectedJobId} instantly from memory.`);
      setJobData(jobsCache[selectedJobId]);
      setIsDecoding(false);
      setIsScanning(false);
      return;
    }

    setJobLoading(true);
    setIsDecoding(false);
    setIsScanning(false);

    fetch(`${API_URL}/api/scan/jd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Gửi đúng language-specific jdText theo lang hiện tại
      body: JSON.stringify({
        jobId: selectedJobId,
        jdText: lang === 'en'
          ? (activeFallbackJob?.jdText_en || activeFallbackJob?.jdText)
          : (activeFallbackJob?.jdText_vi || activeFallbackJob?.jdText),
        lang
      })
    })
      .then((res) => res.json())
      .then((res) => {
        // Chấp nhận response dù dùng field jdText_vi, jdText_en hay jdText cũ
        if (res && res.data && (res.data.jdText_vi || res.data.jdText_en || res.data.jdText)) {
          setJobData(res.data);
          // Lưu vào cache
          setJobsCache((prev) => ({ ...prev, [selectedJobId]: res.data }));
        } else {
          setJobData(activeFallbackJob);
        }
      })
      .catch(() => {
        setJobData(activeFallbackJob);
      })
      .finally(() => {
        setJobLoading(false);
      });
  }, [selectedJobId, activeFallbackJob, viewMode, isCustomResult, jobsCache]);

  // Dynamic Language Switch Handler (Auto re-analyzes custom JD in new language)
  const handleToggleLang = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('career_xray_lang', newLang);

    // Xóa bộ nhớ cache để buộc API quét lại jdText_en hoặc jdText_vi nếu vừa switch ngôn ngữ
    if (viewMode === 'VIEW' && !isCustomResult) {
      // Để user có trải nghiệm tốt hơn, ta KHÔNG xoá toàn bộ cache,
      // mà chỉ dựa vào việc backend sẽ trả về redFlags phù hợp.
      // (Tuy nhiên hiện tại useEffect bị cache hit ngay lập tức, nên UI sẽ tự đổi vì jobData đang chứa cả hai ngôn ngữ)
    }
  }, [viewMode, isCustomResult]);

  // Select Job Case Study from Sidebar
  const handleSelectJob = useCallback((jobId) => {
    setIsCustomResult(false); // Reset custom flag khi chọn bài từ sidebar
    setSelectedJobId(jobId);
    setViewMode('VIEW');
  }, []);

  // Open Custom JD Inspector Form
  const handleOpenCustomInspector = useCallback(() => {
    setViewMode('CUSTOM_INPUT');
  }, []);

  // Handler for custom JD analysis success (auto-switches to VIEW mode with decoded results)
  const handleCustomAnalyzeSuccess = useCallback((inspectedData) => {
    console.log('[CustomInspector] ✅ Analysis payload received:', inspectedData);
    // Gán ID độc nhất để tránh collision với ID Case Study từ MongoDB
    const customJobResult = {
      ...inspectedData,
      id: 'custom-scan-' + Date.now()
    };
    setIsCustomResult(true);  // Bảo vệ jobData khỏi bị useEffect overwrite
    setJobData(customJobResult);
    setIsDecoding(true);
    setIsScanning(false);
    setViewMode('VIEW');
  }, []);

  // isCustomResult = true: luôn dùng jobData (custom scan image/text)
  // isCustomResult = false: dùng jobData nếu có jdText, không thì fallback về bài được select
  const currentJob = isCustomResult ? jobData : ((jobData && (jobData.jdText_vi || jobData.jdText_en || jobData.jdText)) ? jobData : activeFallbackJob);

  // Chỉ hiện full-screen loading spinner khi CHƯA có category nào được tải (lần đầu tiên vào web)
  if (initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="font-semibold text-slate-600">Đang tải hệ thống JD X-RAY...</p>
        </div>
      </div>
    );
  }

  const handleToggleDecode = () => {
    if (!currentJob) return;
    setIsDecoding((prev) => !prev);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900 font-sans antialiased relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Soft Ambient Orbs */}
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-rose-200/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 left-1/3 w-[500px] h-[500px] bg-amber-100/30 rounded-full blur-[120px]" />

        {/* Ambient Floating 3D Depth Elements */}
        <div className="absolute top-32 left-10 w-32 h-32 bg-white/20 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl animate-float-3d opacity-60" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-indigo-50/10 backdrop-blur-lg rounded-full border border-indigo-100/30 shadow-2xl animate-float-3d opacity-50" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-rose-50/20 backdrop-blur-md rounded-[3rem] rotate-45 border border-rose-100/40 shadow-lg animate-float-3d opacity-40" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header Navbar with 🌐 [ EN | VI ] Switcher */}
      <Navbar lang={lang} onToggleLang={handleToggleLang} />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 pt-20">
        {/* Artistic Hero Title Component */}
        <div className="relative overflow-hidden py-8 px-6 mb-8 rounded-3xl bg-gradient-to-r from-indigo-900/5 via-slate-900/5 to-rose-900/5 border border-slate-200/60 shadow-sm">
          {/* 3D Floating Mascot in Background */}
          <HeroMascot3D />

          {/* Artistic Layered Typography */}
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 mb-2 text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-100/80 rounded-full">
              GLOBAL MIL EDUCATIONAL EDITION
            </span>
            <h1 className="text-5xl sm:text-7xl font-bebas tracking-wide uppercase text-slate-900 flex flex-wrap items-center gap-x-3 leading-tight">
              <span>UNPACK THE</span>
              <span className="relative inline-flex items-center overflow-hidden h-[1.1em] px-2 text-indigo-600 text-stroke-indigo">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={keywords[keywordIndex]}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="inline-block will-change-transform transform-gpu"
                  >
                    {keywords[keywordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span>OF WORK</span>
            </h1>
            <p className="mt-2 text-slate-600 font-sans text-sm sm:text-base font-medium max-w-lg">
              AI-Powered Recruitment Scam Diagnostic & Media Information Literacy Toolkit.
            </p>

            {/* Live Audit Pulse / Diagnostic Stats Ticker */}
            <div className="mt-6 max-w-2xl">
              <div className="bg-gradient-to-r from-indigo-200/60 via-slate-200/40 to-transparent h-px w-full my-3" />
              <div className="flex flex-wrap items-center gap-3 my-4">
                {/* Card 1: Live Status Meter */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-semibold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-Time Engine Active</span>
                </motion.div>

                {/* Card 2: Metric Counter Pill */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-xs font-bold shadow-xs">
                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px]">9</span>
                  <span>Documented Cases</span>
                </motion.div>

                {/* Card 3: MIL Standard Badge */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-sm">
                  <span>🛡️ MIL COMPETENCY FRAMEWORK</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side: Nested Case Categories & Custom Inspector Trigger Button */}
          <div className="lg:col-span-3 min-w-[260px] sticky top-20">
            <Sidebar
              cases={caseCategories}
              selectedJobId={selectedJobId}
              onSelectJob={handleSelectJob}
              onOpenCustomInspector={handleOpenCustomInspector}
              viewMode={viewMode}
              isCustomResult={isCustomResult}
              lang={lang}
            />
          </div>

          {/* Center Main Feed: CONDITIONAL RENDERING BASED ON viewMode */}
          <div className="lg:col-span-6 min-w-0 space-y-6 relative z-[100]">
            <AnimatePresence mode="wait">
              {viewMode === 'CUSTOM_INPUT' ? (
                /* Mode 1: Custom Inspector Standalone Input Form ONLY */
                <motion.div 
                  ref={inspectorRef}
                  key="custom-input"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative z-[999] bg-white rounded-2xl shadow-xl"
                >
                  <CustomInspector
                    lang={lang}
                    onAnalyzeSuccess={handleCustomAnalyzeSuccess}
                  />
                </motion.div>
              ) : (
                /* Mode 2: Decoded Job View & Comments ONLY */
                <motion.div 
                  key={`view-mode-${selectedJobId}`}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {jobLoading ? (
                    <div className="p-12 text-center text-slate-400 font-mono text-sm bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/50 animate-pulse">
                      {t.loadingText}
                    </div>
                  ) : currentJob ? (
                    <>
                      {/* Job Card */}
                      <div key={`job-${currentJob.id}`} className="animate-slideUpFade">
                        <JobCard
                          job={currentJob}
                          isDecoding={isDecoding}
                          onToggleDecode={handleToggleDecode}
                          lang={lang}
                        />
                      </div>
  
                      {/* Detailed Decode View Breakdown */}
                      <ErrorBoundary>
                        <div key={`decode-${currentJob.id}`} className="animate-slideUpFade" style={{ animationDelay: '0.1s' }}>
                          <DecodeView
                            job={currentJob}
                            isDecoding={isDecoding}
                            lang={lang}
                          />
                        </div>
                      </ErrorBoundary>
  
                      {/* Comment List with Botnet Seeding X-Ray */}
                      <CommentList
                        comments={currentJob?.comments || []}
                        isScanning={isScanning}
                        onToggleScan={() => setIsScanning(!isScanning)}
                        lang={lang}
                      />
                    </>
                  ) : (
                    <div className="p-12 text-center text-slate-500 font-sans text-sm bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/50">
                      {lang === 'en'
                        ? 'Please select a job post from the sidebar to inspect.'
                        : 'Vui lòng chọn một bài đăng từ thư viện bên trái để kiểm tra.'}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Educational MIL Panel & Widgets */}
          <div className="lg:col-span-3 min-w-[260px] space-y-6 lg:sticky lg:top-20 h-max max-lg:static max-lg:z-0 max-lg:mt-8 lg:z-10">
            <MilCard
              isTriggered={viewMode === 'VIEW' ? true : isDecoding}
              currentJobId={viewMode === 'VIEW' ? selectedJobId : 'custom'}
              lang={lang}
            />

            {/* Quick Verification Rules Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-100/80 border border-slate-200/90 rounded-2xl p-5 shadow-sm backdrop-blur-sm"
            >
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>🛡️</span>
                <span>{lang === 'en' ? 'Quick Verification Rules' : 'Quy tắc Xác thực Nhanh'}</span>
              </h3>
              <ul className="space-y-3">
                <motion.li whileHover={{ x: 2 }} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white/60 p-2.5 rounded-xl border border-slate-200/50">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong className="block text-slate-900">{lang === 'en' ? 'Domain Check' : 'Kiểm tra Domain'}</strong>
                    <span className="opacity-80">{lang === 'en' ? 'Verify official company domain extension.' : 'Xác minh tên miền chính thức của công ty.'}</span>
                  </div>
                </motion.li>
                <motion.li whileHover={{ x: 2 }} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white/60 p-2.5 rounded-xl border border-slate-200/50">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong className="block text-slate-900">{lang === 'en' ? 'Zero Deposit Rule' : 'Quy tắc Không cọc'}</strong>
                    <span className="opacity-80">{lang === 'en' ? 'Never pay fees for interview/equipment.' : 'Tuyệt đối không đóng phí/cọc phỏng vấn.'}</span>
                  </div>
                </motion.li>
                <motion.li whileHover={{ x: 2 }} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white/60 p-2.5 rounded-xl border border-slate-200/50">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">✓</span>
                  <div>
                    <strong className="block text-slate-900">{lang === 'en' ? 'Channel Audit' : 'Kiểm tra Kênh'}</strong>
                    <span className="opacity-80">{lang === 'en' ? 'Flag recruiters operating solely on Telegram/Zalo.' : 'Cảnh giác recruiter chỉ trao đổi qua Telegram/Zalo.'}</span>
                  </div>
                </motion.li>
              </ul>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
