import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/require-role.js";
import { handleResumeUpload } from "../utils/upload.js";
import { ResumeData } from "../models/resume-data.model.js";
import { AppError } from "../utils/errors.js";

const resume = new Hono();

// All resume routes require auth + job_seeker role
resume.use("*", authMiddleware, requireRole("job_seeker"));

// POST /api/resume/upload
resume.post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!file || !(file instanceof File)) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      'No file provided. Send a file with the key "file"',
    );
  }

  // Save file to disk
  const uploaded = await handleResumeUpload(file);

  // Store file URL in resume data (upsert)
  const userId = c.get("userId");
  await ResumeData.findOneAndUpdate(
    { userId },
    { resumeFileUrl: uploaded.fileUrl },
    { upsert: true, new: true },
  );

  // Placeholder parsed response
  // TODO: Replace with actual resume parsing (OpenAI / pdf-parse + LLM)
  const parsedData = {
    skills: [],
    education: [],
    experience: [],
    rawText: `Resume uploaded: ${uploaded.fileName}. Parsing not yet implemented.`,
  };

  return c.json(parsedData);
});

export default resume;
