import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Sparkles, Loader2, AlertCircle, Paperclip, X } from 'lucide-react';
import { translations } from '../../locales/translations.js';
import { SpotlightCard } from '../ui/SpotlightCard.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CustomInspector = ({ lang = 'en', onAnalyzeSuccess }) => {
  const t = translations[lang] || translations.en;
  const [jdText, setJdText] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [mimeType, setMimeType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Clean up object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const processImageFile = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      setMimeType(file.type);
      if (previewUrl) URL.revokeObjectURL(previewUrl); // Clean up previous
      setPreviewUrl(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMsg(lang === 'en' ? 'Only image files are supported for paste/drop.' : 'Chỉ hỗ trợ dán/thả file hình ảnh.');
    }
  }, [lang, previewUrl]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  }, [processImageFile]);

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        e.preventDefault(); // ONLY prevent default if it's an image
        const file = items[i].getAsFile();
        processImageFile(file);
        return;
      }
    }
    // If it's normal text, DO NOT call e.preventDefault(), let textarea handle it natively.
  }, [processImageFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processImageFile(file);
    }
  }, [processImageFile]);

  const removeImage = useCallback(() => {
    setImageBase64(null);
    setMimeType(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrorMsg('');
  }, [previewUrl]);

  const handleAnalyze = useCallback(async (e) => {
    e.preventDefault();
    const sanitizedText = jdText ? jdText.trim() : '';

    if (!sanitizedText && !imageBase64) {
      setErrorMsg(lang === 'en' ? "⚠️ Please paste a JD or upload an image before scanning." : "⚠️ Vui lòng dán nội dung JD hoặc tải ảnh lên trước khi quét.");
      return;
    }

    if (sanitizedText && sanitizedText.length < 80 && !imageBase64) {
      setErrorMsg(lang === 'en' ? "⚠️ Text is too short. A real Job Description usually contains more than 80 characters. Please provide full context." : "⚠️ Nội dung quá ngắn. Một tin tuyển dụng thực tế thường dài hơn 80 ký tự. Vui lòng nhập JD đầy đủ.");
      return;
    }

    setErrorMsg('');
    setAnalyzing(true);

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jdText, imageBase64, mimeType, lang })
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
  }, [jdText, imageBase64, mimeType, lang, onAnalyzeSuccess, t]);

  return (
    <SpotlightCard className="bg-white z-50 border-indigo-200/70 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 mt-2">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg font-display tracking-tight">
          <span>{t.customInspectorTitle}</span>
        </div>
        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-200 uppercase">
          {t.auditEngineBadge}
        </span>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-3 mt-4">
        <div 
          className={`relative rounded-xl border-2 transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <textarea
            rows={4}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            onPaste={handlePaste}
            placeholder={lang === 'en' ? 'Paste Job Description text here, or paste/drop an image (Ctrl+V)...' : 'Dán nội dung Job Description vào đây, hoặc dán/kéo thả ảnh (Ctrl+V)...'}
            className="w-full p-3.5 bg-white/90 border border-indigo-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all font-sans leading-relaxed shadow-sm"
          ></textarea>
        </div>

        {/* EN Disclaimer Note */}
        {lang === 'en' && (
          <p className="text-[10px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 font-medium">
            * Note: Custom Analysis Engine is optimized for the Vietnamese job market. For best results, paste Vietnamese JD text.
          </p>
        )}

        {previewUrl && (
          <div className="relative inline-block mt-2">
            <img src={previewUrl} alt="Preview" className="h-24 w-auto rounded-lg border border-slate-200 shadow-sm object-contain" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 flex items-center justify-center bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 shadow-md transition-colors"
              title="Remove Image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-slate-500">
            {t.supportedPlatforms}
          </p>

          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={analyzing}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-1.5 disabled:opacity-50 border border-slate-200"
            >
              <Paperclip className="w-4 h-4" />
              <span>{lang === 'en' ? 'Attach Image' : 'Đính kèm ảnh'}</span>
            </button>

            <button
              type="submit"
              disabled={analyzing}
              className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50 hover:ring-4 hover:ring-indigo-500/20"
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
        </div>
      </form>
    </SpotlightCard>
  );
};

export default React.memo(CustomInspector);
