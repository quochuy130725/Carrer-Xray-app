const sharp = require('sharp');

/**
 * Nén và resize ảnh Base64 trước khi gửi lên Gemini API.
 * Mục tiêu: Giảm kích thước payload → tăng tốc độ xử lý multimodal.
 *
 * Strategy:
 *  - Resize xuống max 1024px (chiều dài cạnh lớn nhất), giữ tỉ lệ
 *  - Convert sang JPEG với quality 75% (đủ rõ nét để AI đọc text trong ảnh)
 *  - Nếu ảnh nhỏ hơn 200KB thì bỏ qua (không cần nén)
 *
 * @param {string} base64String - Raw base64 string (không có prefix data:image/...)
 * @param {string} mimeType     - Ví dụ: 'image/jpeg', 'image/png', 'image/webp'
 * @returns {Promise<{ base64: string, mimeType: string, originalKB: number, compressedKB: number }>}
 */
const compressImageForGemini = async (base64String, mimeType) => {
  const inputBuffer = Buffer.from(base64String, 'base64');
  const originalKB = Math.round(inputBuffer.length / 1024);

  // Bỏ qua nén nếu ảnh nhỏ hơn 200KB — đã đủ nhẹ
  if (inputBuffer.length < 200 * 1024) {
    return {
      base64: base64String,
      mimeType,
      originalKB,
      compressedKB: originalKB,
      skipped: true
    };
  }

  const compressedBuffer = await sharp(inputBuffer)
    .resize(1024, 1024, {
      fit: 'inside',        // Giữ nguyên tỉ lệ, không crop
      withoutEnlargement: true  // Không phóng to ảnh nhỏ
    })
    .jpeg({ quality: 75, progressive: true })
    .toBuffer();

  const compressedKB = Math.round(compressedBuffer.length / 1024);

  return {
    base64: compressedBuffer.toString('base64'),
    mimeType: 'image/jpeg',   // Sau khi convert → luôn là JPEG
    originalKB,
    compressedKB,
    skipped: false
  };
};

module.exports = { compressImageForGemini };
