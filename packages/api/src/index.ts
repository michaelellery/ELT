import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

const app = new Hono();

app.get("/hello", (c) => {
  return c.json({
    message: "Hello from ELT!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

export const handler = handle(app);

export default app;
