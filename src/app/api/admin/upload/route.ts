import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomBytes } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { processImage } from "@/lib/image-processing";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB — phone photos can be large; we'll downsize after
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/heic", // iPhone default
  "image/heif",
]);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported type ${file.type}. Use JPEG/PNG/WebP/SVG/GIF/HEIC.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.` },
        { status: 400 }
      );
    }

    // Process: resize, auto-orient, color-tune, compress
    const raw = Buffer.from(await file.arrayBuffer());
    const { buffer: processed, ext, contentType } = await processImage(raw, file.type);

    const id = randomBytes(8).toString("hex");
    const filename = `${Date.now()}-${id}.${ext}`;

    // Vercel Blob in production
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/${filename}`, processed, {
        access: "public",
        contentType,
      });
      return NextResponse.json({
        ok: true,
        url: blob.url,
        size: processed.length,
        originalSize: file.size,
      });
    }

    // Local dev: write to public/images/uploads
    const uploadsDir = path.join(process.cwd(), "public", "images", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, processed);
    const url = `/images/uploads/${filename}`;
    return NextResponse.json({
      ok: true,
      url,
      size: processed.length,
      originalSize: file.size,
    });
  } catch (err) {
    console.error("Upload failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
