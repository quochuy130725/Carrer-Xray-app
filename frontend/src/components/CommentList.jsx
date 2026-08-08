import React, { useMemo, useState } from 'react';
import { Bot, ShieldCheck, AlertCircle, MessageSquare, AlertTriangle, CheckCircle2, UserX, Eye, Search } from 'lucide-react';

const CommentList = ({ comments = [], isScanning, onToggleScan, lang = 'en' }) => {
  const [hoveredBotId, setHoveredBotId] = useState(null);
  const isEn = lang === 'en';

  // Calculate Botnet Seeding Ratio & Statistics
  const botStats = useMemo(() => {
    if (!comments || comments.length === 0) return { total: 0, botCount: 0, ratio: 0 };
    const botCount = comments.filter((c) => c.isBot).length;
    const total = comments.length;
    const ratio = Math.round((botCount / total) * 100);
    return { total, botCount, ratio };
  }, [comments]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header section with SEEDING X-RAY toggle */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-sm text-slate-800">
            {isEn ? `Post Comments (${comments.length})` : `Bình luận bài đăng (${comments.length})`}
          </h3>
        </div>

        <button
          onClick={onToggleScan}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm ${isScanning
            ? 'bg-rose-600 text-white ring-2 ring-rose-300 shadow-rose-600/30 animate-pulse'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
        >
          <Bot className="w-4 h-4" />
          {isScanning ? '[SEEDING X-RAY ACTIVE]' : '[SEEDING X-RAY]'}
        </button>
      </div>

      {/* 🔴 Top Pulsing Alarm Banner */}
      {isScanning && comments.length > 0 && (
        <div className="p-4 bg-slate-900 text-white border-b border-slate-800 animate-fadeIn space-y-3">
          <div className="bg-red-950/80 border border-red-500/50 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5 text-rose-300 font-bold">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span>
                {isEn
                  ? `BOTNET SEEDING ALERT: ${botStats.ratio}% (${botStats.botCount}/${botStats.total} comments are FAKE ACCOUNTS)`
                  : `CẢNH BÁO BOTNET SEEDING: ${botStats.ratio}% (${botStats.botCount}/${botStats.total} Bình luận là NICK ẢO)`}
              </span>
            </div>
            <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2.5 py-1 rounded-full font-mono border border-rose-500/40 uppercase font-extrabold">
              {isEn
                ? `⚠️ Risk: ${botStats.ratio > 50 ? 'Very High (Crowd Manipulation)' : botStats.ratio > 0 ? 'Medium (Bot Seeding)' : 'Safe'}`
                : `⚠️ Mức độ rủi ro: ${botStats.ratio > 50 ? 'Rất cao (Crowd Manipulation)' : botStats.ratio > 0 ? 'Trung bình (Bot Seeding)' : 'An toàn'}`}
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${botStats.ratio > 50
                ? 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                : botStats.ratio > 0
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
                }`}
              style={{ width: `${Math.max(botStats.ratio, 5)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Comment List */}
      <div className="p-5 space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-4">
            {isEn ? 'No comments yet.' : 'Chưa có bình luận nào.'}
          </p>
        ) : (
          comments.map((comment) => {
            const isBotDetected = isScanning && comment.isBot;
            const isHovered = hoveredBotId === comment.id;

            // Dual-Data: chọn text và botReason đúng ngôn ngữ
            const commentText = isEn ? (comment.text_en || comment.text || '') : (comment.text_vi || comment.text || '');
            const botReason = isEn ? (comment.botReason_en || comment.botReason || '') : (comment.botReason_vi || comment.botReason || '');

            return (
              <div
                key={comment.id}
                onMouseEnter={() => isBotDetected && setHoveredBotId(comment.id)}
                onMouseLeave={() => setHoveredBotId(null)}
                className={`p-4 rounded-xl transition-all duration-300 relative ${isBotDetected
                  ? 'bg-rose-50/90 border border-rose-300 shadow-sm'
                  : 'bg-slate-50 border border-slate-100 hover:border-slate-200'
                  }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar & Robot Morphing */}
                  <div className="relative flex-shrink-0 cursor-pointer">
                    {isBotDetected ? (
                      <div className="w-10 h-10 rounded-full bg-rose-100 border-2 border-rose-500 flex items-center justify-center text-rose-600 shadow-md ring-2 ring-red-500 ring-offset-1 animate-pulse">
                        <Bot className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={
                            comment.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`
                          }
                          alt={comment.userName}
                          className="w-10 h-10 rounded-full bg-slate-200 object-cover border border-slate-200 shadow-2xs"
                        />
                        {isScanning && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white">
                            <ShieldCheck className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 🚩 Pop-up Profile Signals Card on Hover */}
                    {isBotDetected && isHovered && (
                      <div className="absolute bottom-full left-0 mb-2 w-72 p-3.5 bg-slate-900 text-white text-xs rounded-2xl shadow-2xl z-40 border border-slate-700 animate-fadeIn pointer-events-none">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                          <span className="font-extrabold text-rose-400 flex items-center gap-1">
                            <UserX className="w-4 h-4 text-rose-500" />
                            {isEn ? 'Fake Account Signals (Clone Profile)' : 'Tín hiệu Nick Ảo (Clone Profile)'}
                          </span>
                          <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded font-mono border border-rose-500/40">
                            Botnet Seeding
                          </span>
                        </div>
                        <div className="space-y-1.5 text-slate-300 text-[11px]">
                          <p className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold">🚩 {isEn ? 'Avatar:' : 'Ảnh đại diện:'}</span>
                            <span>{isEn ? 'Stock Pinterest photo / Never set a real profile picture.' : 'Ảnh stock Pinterest / Mặc định chưa đổi avatar thật.'}</span>
                          </p>
                          <p className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold">🚩 {isEn ? 'Post History:' : 'Lịch sử bài viết:'}</span>
                            <span>{isEn ? '0 public posts, account created recently.' : '0 bài viết public, tài khoản mới tạo gần đây.'}</span>
                          </p>
                          <p className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold">🚩 {isEn ? 'Comment Pattern:' : 'Tần suất comment:'}</span>
                            <span>{isEn ? 'Spam comments to artificially boost post engagement in short bursts.' : 'Spam bình luận mồi tạo tương tác giả lập trong ngắn hạn.'}</span>
                          </p>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-amber-300 flex items-center gap-1 font-semibold">
                          <Eye className="w-3 h-3" />
                          {isEn ? 'Part of a Botnet crowd manipulation network' : 'Thuộc mạng lưới Botnet thao túng tâm lý'}
                        </div>
                        <span className="absolute top-full left-4 border-4 border-transparent border-t-slate-900"></span>
                      </div>
                    )}
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-slate-900">{comment.userName}</span>

                      {/* Status Badges */}
                      {isScanning && (
                        isBotDetected ? (
                          <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            🤖 {isEn ? 'CLONE BOTNET' : 'CLONE BOTNET'}
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                            🛡️ {isEn ? 'Real Account' : 'Tài khoản thực'}
                          </span>
                        )
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal">{commentText}</p>

                    {/* Bot Warning Card */}
                    {isBotDetected && botReason && (
                      <div className="mt-2.5 p-3 bg-white border border-rose-300 rounded-xl text-xs text-rose-900 shadow-2xs space-y-1.5 animate-fadeIn">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-700">
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span>{isEn ? 'Exposed Seeding Tactic:' : 'Chiến thuật Seeding bóc trần:'}</span>
                          </div>
                          <span className="text-[10px] font-mono text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {isEn ? 'Hover avatar for profile signals' : 'Hover avatar xem hồ sơ Nick Ảo'}
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          {botReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentList;
