import sharp from "sharp";

export const MAX_DIMENSION = 1600; // px on longest side
export const JPEG_QUALITY = 85;

type Processed = {
  buffer: Buffer;
  ext: "jpg" | "png" | "webp" | "gif" | "svg";
  contentType: string;
};

/**
 * Process an uploaded image so it looks consistent on the public site.
 *
 *   - Auto-orient based on EXIF (fixes phone photos rotated 90°)
 *   - Resize to max 1600 px on the longest side (no upscaling)
 *   - Strip EXIF metadata
 *   - For photos (no alpha): subtle warm tone, light sharpen, JPEG at quality 85
 *   - For images with transparency (logos / icons): preserve PNG
 *   - SVG and GIF pass through unchanged
 */
export async function processImage(input: Buffer, mimeType: string): Promise<Processed> {
  // SVG and GIF: pass through as-is. GIF could be animated; SVG is vector.
  if (mimeType === "image/svg+xml") {
    return { buffer: input, ext: "svg", contentType: "image/svg+xml" };
  }
  if (mimeType === "image/gif") {
    return { buffer: input, ext: "gif", contentType: "image/gif" };
  }

  let pipeline = sharp(input, { failOn: "none" }).rotate(); // auto-orient

  const meta = await pipeline.metadata();
  const hasAlpha = !!meta.hasAlpha;

  pipeline = pipeline.resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (hasAlpha) {
    // Logo / icon-like content: preserve transparency, don't tweak colors.
    const buffer = await pipeline
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    return { buffer, ext: "png", contentType: "image/png" };
  }

  // Photo treatment: subtle warmth + light sharpen, then JPEG.
  const buffer = await pipeline
    .normalize() // gentle auto-contrast
    .modulate({ saturation: 1.06, brightness: 1.01 }) // a touch warmer
    .sharpen({ sigma: 0.5, m1: 0.5, m2: 1 })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
  return { buffer, ext: "jpg", contentType: "image/jpeg" };
}
