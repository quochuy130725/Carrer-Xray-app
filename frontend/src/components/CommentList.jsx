import React from 'react';
import { Bot, ShieldCheck, AlertCircle, MessageSquare } from 'lucide-react';

const CommentList = ({ comments, isScanning, onToggleScan }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header section with SEEDING X-RAY toggle */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-sm text-slate-800">
            Bình luận bài đăng ({comments.length})
          </h3>
        </div>

        <button
          onClick={onToggleScan}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
            isScanning
              ? 'bg-rose-600 text-white ring-2 ring-rose-300 shadow-rose-600/30 animate-pulse'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          {isScanning ? '[SEEDING X-RAY ACTIVE]' : '[SEEDING X-RAY]'}
        </button>
      </div>

      {/* Comment List */}
      <div className="p-5 space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-4">Chưa có bình luận nào.</p>
        ) : (
          comments.map((comment) => {
            const isBotDetected = isScanning && comment.isBot;

            return (
              <div
                key={comment.id}
                className={`p-4 rounded-xl transition-all duration-300 ${
                  isBotDetected
                    ? 'bg-rose-50/90 border border-rose-300 shadow-sm relative overflow-hidden'
                    : 'bg-slate-50 border border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar Morphing Logic */}
                  <div className="relative">
                    {isBotDetected ? (
                      <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/40 animate-bounce">
                        <Bot className="w-6 h-6" />
                      </div>
                    ) : (
                      <img
                        src={
                          comment.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`
                        }
                        alt={comment.userName}
                        className="w-10 h-10 rounded-full bg-slate-200 object-cover border border-slate-200"
                      />
                    )}
                  </div>

                  {/* Comment Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-slate-900">{comment.userName}</span>

                      {/* Status Tag */}
                      {isScanning && (
                        isBotDetected ? (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <AlertCircle className="w-3 h-3" /> BOTNET SEEDING
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Tài khoản thực
                          </span>
                        )
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{comment.text}</p>

                    {/* Bot Reason Tag */}
                    {isBotDetected && comment.botReason && (
                      <div className="mt-2.5 p-2.5 bg-white border border-rose-200 rounded-lg text-[11px] text-rose-700 flex items-start gap-2 shadow-2xs">
                        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Cảnh báo Seeding:</span> {comment.botReason}
                        </div>
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
