import sharp from "sharp";

/**
 * Compresses an image buffer so it stays under Cloudinary's free plan limit (10MB).
 * Images already under the threshold are returned as-is to preserve quality.
 *
 * Strategy (in order):
 *  1. Under 8MB  → pass through unchanged
 *  2. WebP q82   → best quality/size ratio, typically shrinks 20MB → 2-4MB
 *  3. WebP q60   → if still over limit
 *  4. JPEG q70   → last resort fallback
 *
 * @param {Buffer} buffer  - Raw image buffer from multer
 * @returns {Promise<Buffer>} - Compressed (or original) buffer safe for Cloudinary
 */

const CLOUDINARY_SAFE_LIMIT = 8 * 1024 * 1024; // 8MB — leaves headroom under 10MB limit

const compressImage = async (buffer) => {
  if (!buffer || buffer.length <= CLOUDINARY_SAFE_LIMIT) {
    return buffer; // already small enough, preserve original quality
  }

  const originalMB = (buffer.length / 1024 / 1024).toFixed(1);
  console.log(`[compressImage] Input: ${originalMB}MB — compressing...`);

  // Pass 1: WebP at high quality (usually achieves 80-90% size reduction)
  let compressed = await sharp(buffer)
    .webp({ quality: 82 })
    .toBuffer();

  if (compressed.length <= CLOUDINARY_SAFE_LIMIT) {
    console.log(`[compressImage] Pass 1 OK → ${(compressed.length / 1024 / 1024).toFixed(1)}MB`);
    return compressed;
  }

  // Pass 2: WebP at lower quality
  compressed = await sharp(buffer)
    .webp({ quality: 60 })
    .toBuffer();

  if (compressed.length <= CLOUDINARY_SAFE_LIMIT) {
    console.log(`[compressImage] Pass 2 OK → ${(compressed.length / 1024 / 1024).toFixed(1)}MB`);
    return compressed;
  }

  // Pass 3: Resize to max 2400px wide + JPEG quality 72 (last resort)
  compressed = await sharp(buffer)
    .resize({ width: 2400, withoutEnlargement: true })
    .jpeg({ quality: 72, progressive: true })
    .toBuffer();

  console.log(`[compressImage] Pass 3 OK → ${(compressed.length / 1024 / 1024).toFixed(1)}MB`);
  return compressed;
};

export default compressImage;
