import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { cors } from "hono/cors";
import chatRouter from "./routes/chat.js";
import calculatorRouter from "./routes/calculator.js";
import compareRouter from "./routes/compare.js";
import productsRouter from "./routes/products.js";
import { rateLimiter } from "./middleware/rate-limit.js";

const app = new Hono();

// CORS — allow CloudFront domains and localhost dev
app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      const allowed = [
        /^https:\/\/.*\.cloudfront\.net$/,
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
      ];
      return allowed.some((r) => r.test(origin ?? "")) ? origin! : "";
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400,
  })
);

// Rate limiter on chat endpoint
app.use("/api/chat", rateLimiter);

// Routes
app.route("/api", chatRouter);
app.route("/api", calculatorRouter);
app.route("/api", compareRouter);
app.route("/api", productsRouter);

// Legacy endpoints
app.get("/hello", (c) => {
  return c.json({
    message: "Hello from ELT!",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/api/health", (c) => {
  return c.json({ status: "ok", service: "elt-api", version: "2.0.0" });
});

export const handler = handle(app);

export default app;
