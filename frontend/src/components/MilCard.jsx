import React from 'react';
import { Award, Lightbulb, CheckCircle2, ShieldAlert } from 'lucide-react';

const MilCard = ({ isTriggered }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-2xl border border-slate-700/80 shadow-xl sticky top-20">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/60">
        <div className="p-2 bg-amber-400/10 rounded-xl border border-amber-400/20 text-amber-400">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-amber-300">Bài học UNESCO MIL</h3>
          <p className="text-[11px] text-slate-400">Năng lực số & Phản biện</p>
        </div>
      </div>

      {isTriggered ? (
        <div className="space-y-3 animate-fadeIn">
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-[#ff2a55] font-bold text-xs mb-1">
              <ShieldAlert className="w-4 h-4" /> Nguyên tắc 3 KHÔNG khi xin việc
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li><strong className="text-white">KHÔNG</strong> đóng bất kỳ phí cọc, hồ sơ hay đồng phục nào.</li>
              <li><strong className="text-white">KHÔNG</strong> vội vã tin vào bình luận khen ngợi quá đà.</li>
              <li><strong className="text-white">KHÔNG</strong> giao dịch qua app ẩn danh (Telegram, Zalo kín).</li>
            </ul>
          </div>

          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1">
              <Lightbulb className="w-4 h-4" /> Hành động cần làm:
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tra cứu Mã số thuế công ty trên Cổng thông tin Quốc gia trước khi gửi CV hoặc tham gia phỏng vấn.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-300 space-y-3">
          <p className="leading-relaxed">
            Kích hoạt chế độ <strong className="text-[#ff2a55]">[DECODE JD]</strong> hoặc <strong className="text-[#ff2a55]">[SEEDING X-RAY]</strong> trên bài viết để bóc tách thông tin và xem bài học phản biện từ UNESCO MIL.
          </p>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 flex items-center gap-2.5 text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>X-Ray the JD. Unmask the trap.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilCard;
