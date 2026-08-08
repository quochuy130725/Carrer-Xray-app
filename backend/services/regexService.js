/**
 * Advanced Vietnamese Anti-Scam Regex Dictionary
 * Production-grade pattern matcher cho bẫy lừa đảo tuyển dụng
 */
const scamPatterns = [
  {
    category: 'Unofficial Redirect',
    regex: /(zalo|zl|telegram|tele|inbox|ib|nhắn tin riêng|@gmail\.com|@yahoo\.com|@hotmail\.com|liên hệ trực tiếp qua sđt|call\/zalo|gọi\/zalo)/gi,
    reason_en: 'Unofficial contact channel bypassing formal corporate HR procedures to evade platform moderation and regulatory scrutiny.',
    reason_vi: 'Sử dụng kênh liên lạc cá nhân hoặc ẩn danh, né tránh quy trình HR chính quy của doanh nghiệp để dễ dàng lừa đảo và thoát trách nhiệm pháp lý.'
  },
  {
    category: 'Upfront Deposit Trap',
    regex: /(cọc|đặt cọc|đóng phí|phí thiết bị|phí làm thẻ|phí đồng phục|chuyển khoản|giữ chỗ|thế chân|đóng tiền|nộp tiền|phí tài liệu|phí bảo mật|phí xét duyệt)/gi,
    reason_en: 'Illegal upfront fee request under Labor Code 2019 Art. 17. Reputable employers NEVER ask candidates to pay deposit fees or equipment charges.',
    reason_vi: 'Hành vi thu phí trái phép theo Điều 17 Bộ Luật Lao Động 2019. Doanh nghiệp uy tín KHÔNG BAO GIỜ yêu cầu ứng viên đóng tiền cọc hoặc phí tài sản.'
  },
  {
    category: 'Unrealistic Compensation',
    regex: /(thu nhập không giới hạn|việc nhẹ lương cao|up to \d{2,}\.000|cành\/trang|lương cứng \d{1,2}tr|hoa hồng cao|thu nhập khủng|kiếm \d{2,}tr|lương thực nhận|không cần kinh nghiệm.{0,20}lương)/gi,
    reason_en: 'Unrealistic or vaguely massive compensation claims designed to trigger FOMO (Fear Of Missing Out) among entry-level job seekers.',
    reason_vi: 'Mức lương ảo hoặc mập mờ nhằm thao túng tâm lý tham lam và sợ bỏ lỡ (FOMO) của ứng viên thiếu kinh nghiệm.'
  },
  {
    category: 'Task Escalation Trap',
    regex: /(kích hoạt tài khoản|sai nội dung|phòng tài chính|làm nhiệm vụ|đơn hàng ảo|nạp tiền rút tiền|mã xác nhận|làm cộng tác viên online|nhiệm vụ đánh giá|app kiếm tiền)/gi,
    reason_en: "Classic 'Task Escalation' scam — fake orders, account activation fees, or financial manipulation to continuously extract money from victims.",
    reason_vi: "Dấu hiệu điển hình của bẫy 'Nhiệm vụ đa cấp': thao túng nạn nhân nạp tiền liên tục với cớ sửa lỗi đơn hàng hoặc kích hoạt tài khoản."
  },
  {
    category: 'Urgency & Pressure Tactics',
    regex: /(tuyển gấp|chỉ còn \d+ suất|hết hạn hôm nay|nộp hồ sơ ngay|số lượng có hạn|ưu tiên liên hệ sớm|tuyển ngay trong ngày)/gi,
    reason_en: 'Artificial urgency designed to pressure applicants into skipping due diligence checks before engaging with the recruiter.',
    reason_vi: 'Tạo áp lực thời gian giả tạo nhằm ép ứng viên hành động vội vàng, không kịp xác minh thông tin doanh nghiệp.'
  },
  {
    category: 'Anonymous Identity',
    regex: /(công ty không cần biết tên|không cần hồ sơ|không cần CV|chỉ cần cmnd|chỉ cần cccd|không cần bằng cấp.{0,15}không cần kinh nghiệm)/gi,
    reason_en: 'Suspicious requests to bypass standard identity verification — a hallmark of fraudulent job postings that avoid accountability.',
    reason_vi: 'Bỏ qua quy trình xác minh nhân thân là dấu hiệu điển hình của bài đăng giả mạo, né tránh trách nhiệm pháp lý.'
  }
];

const analyzeWithRegex = (jdText, lang = 'en') => {
  const redFlags = [];

  scamPatterns.forEach((pattern) => {
    const matches = jdText.match(pattern.regex);
    if (matches) {
      // Loại bỏ trùng lặp (Set) — tránh highlight cùng 1 từ nhiều lần
      const uniqueMatches = [...new Set(matches.map((m) => m.trim()))];
      uniqueMatches.forEach((match) => {
        redFlags.push({
          phrase: match,        // Nguyên văn 100% từ văn bản gốc
          reason: lang === 'vi' ? pattern.reason_vi : pattern.reason_en,
          category: pattern.category
        });
      });
    }
  });

  return redFlags;
};

module.exports = { analyzeWithRegex };
