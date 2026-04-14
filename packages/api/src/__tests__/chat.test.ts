import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../index.js";

// Mock Anthropic SDK to avoid real API calls
vi.mock("@anthropic-ai/sdk", () => {
  const mockStream = {
    [Symbol.asyncIterator]: async function* () {
      yield {
        type: "content_block_delta",
        delta: { type: "text_delta", text: "Hello from BrightWay Assistant!" },
      };
    },
    finalMessage: async () => ({
      id: "msg_test",
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "Hello from BrightWay Assistant!" }],
      stop_reason: "end_turn",
      stop_sequence: null,
      model: "claude-opus-4-20250514",
      usage: { input_tokens: 10, output_tokens: 10 },
    }),
  };

  return {
    default: class MockAnthropic {
      messages = {
        stream: vi.fn().mockReturnValue(mockStream),
      };
    },
  };
});

describe("GET /health", () => {
  it("returns ok status", async () => {
    const req = new Request("http://localhost/health");
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ok");
  });
});

describe("GET /api/health", () => {
  it("returns ok with service info", async () => {
    const req = new Request("http://localhost/api/health");
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; service: string };
    expect(body.status).toBe("ok");
    expect(body.service).toBe("elt-api");
  });
});

describe("GET /api/products", () => {
  it("returns array of all cards", async () => {
    const req = new Request("http://localhost/api/products");
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(11); // 3 BrightWay + 8 competitors
  });
});

describe("GET /api/products/:id", () => {
  it("returns a specific card by ID", async () => {
    const req = new Request("http://localhost/api/products/brightway-standard");
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: string; name: string };
    expect(body.id).toBe("brightway-standard");
    expect(body.name).toBe("BrightWay");
  });

  it("returns 404 for unknown card ID", async () => {
    const req = new Request("http://localhost/api/products/nonexistent-card");
    const res = await app.fetch(req);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/calculator", () => {
  it("returns calculation result for valid input", async () => {
    const req = new Request("http://localhost/api/calculator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthlySpending: 500,
        annualFee: 49,
        carriesBalance: false,
      }),
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      annualCashBack: number;
      netBenefit: number;
      recommendation: string;
    };
    expect(body.annualCashBack).toBe(60);
    expect(body.netBenefit).toBe(11);
    expect(["positive", "cautious", "negative"]).toContain(body.recommendation);
  });

  it("returns 400 for invalid input (negative spending)", async () => {
    const req = new Request("http://localhost/api/calculator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlySpending: -100 }),
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing required field", async () => {
    const req = new Request("http://localhost/api/calculator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/compare", () => {
  it("returns comparison result for valid input", async () => {
    const req = new Request("http://localhost/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brightwayCardId: "brightway-standard",
        competitorIds: ["capital-one-platinum-secured"],
      }),
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      cards: unknown[];
      dimensions: unknown[];
      verdict: string;
    };
    expect(body.cards).toHaveLength(2);
    expect(body.dimensions.length).toBeGreaterThan(0);
    expect(body.verdict).toBeDefined();
  });

  it("returns 200 with empty body (uses defaults)", async () => {
    const req = new Request("http://localhost/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
  });
});

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for empty message", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        message: "",
      }),
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for message that is too long", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        message: "x".repeat(2001),
      }),
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for PII in message (SSN)", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        message: "My SSN is 123-45-6789",
      }),
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("pii_detected");
  });

  it("returns 400 for PII in message (credit card number)", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Card: 4111-1111-1111-1111",
      }),
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("pii_detected");
  });

  it("returns SSE stream for valid message", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "550e8400-e29b-41d4-a716-446655440001",
        message: "What is BrightWay?",
      }),
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    // SSE responses use text/event-stream content type
    const contentType = res.headers.get("Content-Type");
    expect(contentType).toContain("text/event-stream");
  });
});
