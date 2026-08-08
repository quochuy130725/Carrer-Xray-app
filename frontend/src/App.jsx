import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import JobCard from './components/JobCard.jsx';
import DecodeView from './components/DecodeView.jsx';
import CommentList from './components/CommentList.jsx';
import MilCard from './components/MilCard.jsx';
import CustomInspector from './components/CustomInspector.jsx';
import { translations } from './locales/translations.js';

export default function App() {
  // Global Language State (Default 'en' for UNESCO international evaluation)
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('career_xray_lang') || 'en';
  });

  const t = translations[lang] || translations.en;

  // View Mode State: 'VIEW' (Main Feed Decoder) | 'CUSTOM_INPUT' (Standalone Inspector Form)
  const [viewMode, setViewMode] = useState('VIEW');

  const [caseCategories, setCaseCategories] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('job-001');
  const [jobData, setJobData] = useState(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  // Flag ngăn useEffect overwrite jobData khi vừa phân tích custom JD xong
  const [isCustomResult, setIsCustomResult] = useState(false);

  // 1. Fetch Case Categories dynamically from Backend API (MongoDB Atlas Primary)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch('http://localhost:5000/api/scan/cases')
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
        if (isMounted) setLoading(false);
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

  // 3. Fetch detailed job data for selected post (bỏ qua khi đang hiển thị kết quả Custom Inspector)
  useEffect(() => {
    if (!selectedJobId || viewMode !== 'VIEW') return;
    // Quan trọng: Không fetch lại nếu vừa switch về VIEW từ custom analysis
    if (isCustomResult) return;

    setLoading(true);
    setIsDecoding(false);
    setIsScanning(false);

    fetch('http://localhost:5000/api/scan/jd', {
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
        } else {
          setJobData(activeFallbackJob);
        }
      })
      .catch(() => {
        setJobData(activeFallbackJob);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedJobId, activeFallbackJob, viewMode, isCustomResult]);

  // Dynamic Language Switch Handler (Auto re-analyzes custom JD in new language)
  const handleToggleLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('career_xray_lang', newLang);

    // Re-analyze custom JD payload if active
    if (jobData && jobData.id && jobData.id.toString().includes('custom') && jobData.jdText) {
      fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jdText: jobData.jdText, lang: newLang })
      })
        .then((res) => res.json())
        .then((res) => {
          if (res && res.success && res.data) {
            setJobData(res.data);
          }
        })
        .catch(() => {});
    }
  };

  // Select Job Case Study from Sidebar
  const handleSelectJob = (jobId) => {
    setIsCustomResult(false); // Reset custom flag khi chọn bài từ sidebar
    setSelectedJobId(jobId);
    setViewMode('VIEW');
  };

  // Open Custom JD Inspector Form
  const handleOpenCustomInspector = () => {
    setViewMode('CUSTOM_INPUT');
  };

  // Handler for custom JD analysis success (auto-switches to VIEW mode with decoded results)
  const handleCustomAnalyzeSuccess = (inspectedData) => {
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
  };

  const currentJob = (jobData && jobData.jdText) ? jobData : activeFallbackJob;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header Navbar with 🌐 [ EN | VI ] Switcher */}
      <Navbar lang={lang} onToggleLang={handleToggleLang} />

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Nested Case Categories & Custom Inspector Trigger Button */}
        <div className="lg:col-span-3">
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
        <div className="lg:col-span-6 space-y-6">
          {viewMode === 'CUSTOM_INPUT' ? (
            /* Mode 1: Custom Inspector Standalone Input Form ONLY */
            <div className="animate-fadeIn">
              <CustomInspector
                lang={lang}
                onAnalyzeSuccess={handleCustomAnalyzeSuccess}
              />
            </div>
          ) : (
            /* Mode 2: Decoded Job View & Comments ONLY */
            <>
              {loading ? (
                <div className="p-12 text-center text-slate-400 font-mono text-sm bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse">
                  {t.loadingText}
                </div>
              ) : currentJob ? (
                <>
                  {/* Job Card */}
                  <JobCard
                    job={currentJob}
                    isDecoding={isDecoding}
                    onToggleDecode={() => setIsDecoding(!isDecoding)}
                    lang={lang}
                  />

                  {/* Detailed Decode View Breakdown */}
                  <DecodeView
                    job={currentJob}
                    isDecoding={isDecoding}
                    lang={lang}
                  />

                  {/* Comment List with Botnet Seeding X-Ray */}
                  <CommentList
                    comments={currentJob?.comments || []}
                    isScanning={isScanning}
                    onToggleScan={() => setIsScanning(!isScanning)}
                    lang={lang}
                  />
                </>
              ) : (
                <div className="p-12 text-center text-slate-500 font-sans text-sm bg-white rounded-2xl border border-slate-200">
                  {lang === 'en'
                    ? 'Please select a job post from the sidebar to inspect.'
                    : 'Vui lòng chọn một bài đăng từ thư viện bên trái để kiểm tra.'}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side: UNESCO MIL Reflection Card */}
        <div className="lg:col-span-3">
          <MilCard
            isTriggered={isDecoding || isScanning || viewMode === 'CUSTOM_INPUT'}
            currentJobId={selectedJobId}
            lang={lang}
          />
        </div>
      </main>
    </div>
  );
}
