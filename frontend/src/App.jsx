import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import JobCard from './components/JobCard';
import CommentList from './components/CommentList';
import MilCard from './components/MilCard';

// Danh sách các Case Study demo
const CASE_STUDIES = [
  { id: 'job-001', name: '🚨 Case #1: Lừa cọc TTS' },
  { id: 'job-002', name: '⚠️ Case #2: KPI Ảo & Multi-Task' },
  { id: 'job-003', name: '🤖 Case #3: Seeding Telegram' },
];

export default function App() {
  const [selectedCaseId, setSelectedCaseId] = useState('job-001');
  const [jobData, setJobData] = useState(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu theo selectedCaseId
  useEffect(() => {
    setLoading(true);
    // Reset trạng thái soi khi đổi Case
    setIsDecoding(false);
    setIsScanning(false);

    fetch('http://localhost:5000/api/scan/jd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: selectedCaseId })
    })
      .then((res) => res.json())
      .then((res) => {
        setJobData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCaseId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: Dynamic Case Study Selector */}
        <div className="lg:col-span-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">Case Studies</h3>
            {CASE_STUDIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${selectedCaseId === c.id
                  ? 'bg-red-50 text-[#ff2a55] border border-red-200 shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                  }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Center Main Feed */}
        <div className="lg:col-span-6 space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-mono text-sm">Đang tải dữ liệu Case Study...</div>
          ) : (
            <>
              <JobCard job={jobData} isDecoding={isDecoding} onToggleDecode={() => setIsDecoding(!isDecoding)} />
              <CommentList comments={jobData?.comments || []} isScanning={isScanning} onToggleScan={() => setIsScanning(!isScanning)} />
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="lg:col-span-3">
          <MilCard isTriggered={isDecoding || isScanning} />
        </div>
      </main>
    </div>
  );
}
