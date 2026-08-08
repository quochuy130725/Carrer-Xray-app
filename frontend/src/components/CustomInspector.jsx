import React, { useState } from 'react';
import { Search, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { translations } from '../locales/translations.js';

const CustomInspector = ({ lang = 'en', onAnalyzeSuccess }) => {
  const t = translations[lang] || translations.en;
  const [jdText, setJdText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jdText || jdText.trim() === '') {
      setErrorMsg(t.pastePromptError);
      return;
    }

    setErrorMsg('');
    setAnalyzing(true);

    try {
      const res = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jdText, lang })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();

      if (data && data.success && data.data) {
        onAnalyzeSuccess(data.data);
      } else {
        setErrorMsg(data.message || (lang === 'en' ? 'Analysis failed.' : 'Phân tích thất bại.'));
      }
    } catch (err) {
      console.error('Custom Inspector Fetch Error:', err);
      setErrorMsg(`${t.serverConnError} (${err.message})`);
    } finally {
      // Đảm bảo LUÔN LUÔN tắt trạng thái loading ngay cả khi server báo lỗi hoặc sập mạng
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-rose-600 font-extrabold text-sm">
          <Search className="w-4 h-4" />
          <span>{t.customInspectorTitle}</span>
        </div>
        <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 uppercase">
          {t.auditEngineBadge}
        </span>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-3">
        <div className="relative">
          <textarea
            rows={4}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder={t.customInspectorPlaceholder}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-sans leading-relaxed"
          ></textarea>
        </div>

        {/* EN Disclaimer Note */}
        {lang === 'en' && (
          <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 font-medium">
            * Note: Custom Analysis Engine is optimized for the Vietnamese job market. For best results, paste Vietnamese JD text.
          </p>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400">
            {t.supportedPlatforms}
          </p>

          <button
            type="submit"
            disabled={analyzing}
            className="px-5 py-2 bg-gradient-to-r from-rose-600 to-[#ff2a55] text-white text-xs font-extrabold rounded-xl hover:shadow-md hover:shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.analyzingText}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.analyzeBtn}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomInspector;
