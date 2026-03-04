import type { MiddlewareHandler } from "hono";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

// Extend Hono's context variables
declare module "hono" {
  interface ContextVariableMap {
    userId: string;
    userEmail: string;
    userRoles: string[];
  }
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(
      401,
      "AUTH_REQUIRED",
      "Authentication token is required",
    );
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    c.set("userId", decoded.sub);
    c.set("userEmail", decoded.email);
    c.set("userRoles", decoded.roles);

    await next();
  } catch {
    throw new AppError(401, "AUTH_REQUIRED", "Invalid or expired token");
  }
};
