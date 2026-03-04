import { Hono } from "hono";
import jwt from "jsonwebtoken";
import type { IUser } from "../models/user.model.js";
import { User } from "../models/user.model.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";
import { authMiddleware } from "../middleware/auth.js";
import { signupSchema, loginSchema } from "../validators/auth.validator.js";

const auth = new Hono();

// Helper: generate JWT token
function generateToken(user: IUser): string {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    roles: user.roles,
  };

  return jwt.sign(
    payload,
    env.JWT_SECRET as jwt.Secret,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions,
  );
}

// POST /api/auth/signup
auth.post("/signup", async (c) => {
  const body = await c.req.json();
  const data = signupSchema.parse(body);

  // Check if email already exists
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new AppError(
      409,
      "EMAIL_EXISTS",
      "An account with this email already exists",
    );
  }

  // Create user
  const user = new User({
    name: data.name,
    email: data.email,
    passwordHash: data.password, // pre-save hook will hash this
  });

  await user.save();

  const token = generateToken(user);

  return c.json(
    {
      user: user.toJSON(),
      token,
    },
    201,
  );
});

// POST /api/auth/login
auth.post("/login", async (c) => {
  const body = await c.req.json();
  const data = loginSchema.parse(body);

  // Find user by email
  const user = await User.findOne({ email: data.email });
  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  // Compare password
  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const token = generateToken(user);

  return c.json({
    user: user.toJSON(),
    token,
  });
});

// POST /api/auth/logout (stateless — client discards token)
auth.post("/logout", authMiddleware, async (c) => {
  return c.json({ success: true });
});

// GET /api/auth/me
auth.get("/me", authMiddleware, async (c) => {
  const userId = c.get("userId");

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(401, "AUTH_REQUIRED", "User not found");
  }

  return c.json({ user: user.toJSON() });
});

export default auth;
