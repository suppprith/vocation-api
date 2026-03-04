import { AppError } from "./errors.js";
import fs from "fs";
import path from "path";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_DIR = path.resolve("uploads", "resumes");

// Ensure upload directory exists
function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export interface UploadedFile {
  fileName: string;
  filePath: string;
  fileUrl: string;
}

export async function handleResumeUpload(file: File): Promise<UploadedFile> {
  // Validate file type
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new AppError(
      400,
      "UNSUPPORTED_FILE_TYPE",
      `File type "${ext}" is not supported. Accepted: ${ALLOWED_EXTENSIONS.join(", ")}`,
    );
  }

  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new AppError(
      400,
      "UNSUPPORTED_FILE_TYPE",
      `MIME type "${file.type}" is not supported`,
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(
      413,
      "FILE_TOO_LARGE",
      `File size exceeds the maximum limit of 10MB`,
    );
  }

  ensureUploadDir();

  // Generate unique filename
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${timestamp}_${safeName}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  // Write file to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return {
    fileName,
    filePath,
    fileUrl: `/uploads/resumes/${fileName}`,
  };
}
