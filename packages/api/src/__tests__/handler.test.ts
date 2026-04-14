import { describe, it, expect } from "vitest";
import app from "../index.js";

describe("GET /hello", () => {
  it("returns the hello message", async () => {
    const req = new Request("http://localhost/hello");
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string; timestamp: string; version: string };
    expect(body.message).toBe("Hello from ELT!");
    expect(body.version).toBe("2.0.0");
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("GET /health", () => {
  it("returns ok status", async () => {
    const req = new Request("http://localhost/health");
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe("ok");
  });
});
