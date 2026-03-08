import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/error-handler.js";
import authRoutes from "./routes/auth.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import onboardingRoutes from "./routes/onboarding.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";
import applicationsRoutes from "./routes/applications.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import companyRoutes from "./routes/company.routes.js";
import employerJobsRoutes from "./routes/employer-jobs.routes.js";
import swaggerRoutes from "./routes/swagger.routes.js";

const app = new Hono();

// Global middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*", // Restrict to frontend domain in production
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Global error handler
app.onError(errorHandler);

// Health check
app.get("/", (c) => {
  return c.json({ status: "ok", message: "Vocation API is running" });
});

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/resume", resumeRoutes);
app.route("/api/onboarding", onboardingRoutes);
app.route("/api/profile", profileRoutes);
app.route("/api/jobs", jobsRoutes);
app.route("/api/applications", applicationsRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/company", companyRoutes);
app.route("/api/employer/jobs", employerJobsRoutes);
app.route("/api/docs", swaggerRoutes);

// Start server
async function main() {
  await connectDB();

  serve(
    {
      fetch: app.fetch,
      port: env.PORT,
    },
    (info) => {
      console.log(`🚀 Server is running on http://localhost:${info.port}`);
    },
  );
}

main();
