import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/require-role.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/errors.js";

const onboarding = new Hono();

// All onboarding routes require auth + job_seeker role
onboarding.use("*", authMiddleware, requireRole("job_seeker"));

// POST /api/onboarding/complete
onboarding.post("/complete", async (c) => {
  const userId = c.get("userId");

  const user = await User.findByIdAndUpdate(
    userId,
    { onboardingComplete: true },
    { new: true },
  );

  if (!user) {
    throw new AppError(404, "NOT_FOUND", "User not found");
  }

  return c.json({
    user: {
      id: user._id,
      onboardingComplete: user.onboardingComplete,
    },
  });
});

export default onboarding;
