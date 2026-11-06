import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

const EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize admin
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const formData = await req.formData();
    // Gather all uploaded files from 'files' or 'file' keys
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if ((key === "files" || key === "file") && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No image files provided." }, { status: 400 });
    }

    // 2. Validate all files
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            error: `Unsupported file format (${file.type || "unknown"}). Allowed formats: JPG, PNG, WEBP, SVG, GIF.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds the maximum allowed size of 5MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Ensure destination directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(uploadDir, { recursive: true });

    // 4. Save files to disk and construct metadata objects
    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = EXTENSION_MAP[file.type] || "jpg";
      const uniqueSuffix = crypto.randomBytes(6).toString("hex");
      const filename = `luc-prod-${Date.now()}-${uniqueSuffix}.${ext}`;
      const filePath = path.join(uploadDir, filename);

      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/products/${filename}`;
      const baseName = file.name.replace(/\.[^/.]+$/, "");

      uploadedImages.push({
        id: `img-${Date.now()}-${uniqueSuffix}`,
        url: publicUrl,
        altText: baseName || "Product View",
        isMain: i === 0,
        order: i,
      });
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
      count: uploadedImages.length,
    });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload images. Please try again." },
      { status: 500 }
    );
  }
}
