import type { ErrorHandler } from "hono";
import { AppError } from "../utils/errors.js";
import { ZodError } from "zod";

export const errorHandler: ErrorHandler = (err, c) => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details,
        },
      },
      400,
    );
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details && { details: err.details }),
        },
      },
      err.statusCode as 400,
    );
  }

  // Handle unknown errors
  console.error("Unhandled error:", err);
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    500,
  );
};
