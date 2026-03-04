import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/error-handler.js";
import authRoutes from "./routes/auth.routes.js";

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
