import type { MiddlewareHandler } from "hono";
import { AppError } from "../utils/errors.js";

export function requireRole(...roles: string[]): MiddlewareHandler {
  return async (c, next) => {
    const userRoles = c.get("userRoles");

    if (!userRoles || !roles.some((role) => userRoles.includes(role))) {
      throw new AppError(
        403,
        "FORBIDDEN",
        `This action requires one of the following roles: ${roles.join(", ")}`,
      );
    }

    await next();
  };
}
