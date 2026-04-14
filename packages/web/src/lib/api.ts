/**
 * API Client — fetch + SSE streaming for /api/chat
 */

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export interface StreamEvent {
  type: "text" | "tool_call" | "tool_result" | "done" | "error";
  text?: string;
  name?: string;
  input?: Record<string, unknown>;
  result?: Record<string, unknown>;
  message?: string;
}

export interface CalcRequest {
  monthlySpending: number;
  annualFee: number;
  carriesBalance: boolean;
  averageBalance?: number;
  cardId?: string;
}

export interface CalcResult {
  annualCashBack: number;
  annualFee: number;
  netBenefit: number;
  interestCost?: number;
  trueNet?: number;
  recommendation: "positive" | "cautious" | "negative";
  explanation: string;
}

/**
 * Send a chat message and stream SSE events back.
 * Uses fetch + ReadableStream (NOT EventSource, which is GET-only).
 */
export async function* streamChat(
  sessionId: string,
  message: string,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events: split on double newline
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        if (!part.trim()) continue;

        const lines = part.split("\n");
        let eventType = "text";
        let dataStr = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            dataStr = line.slice(6).trim();
          }
        }

        if (!dataStr) continue;

        try {
          const event = JSON.parse(dataStr) as StreamEvent;
          yield { ...event, type: eventType as StreamEvent["type"] };
        } catch {
          // Skip malformed events
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Standalone calculator (no AI, direct compute)
 */
export async function calculate(req: CalcRequest): Promise<CalcResult> {
  const response = await fetch(`${API_URL}/api/calculator`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    throw new Error(`Calculator API error: ${response.status}`);
  }

  return response.json() as Promise<CalcResult>;
}

/**
 * Health check
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const resp = await fetch(`${API_URL}/api/health`);
    return resp.ok;
  } catch {
    return false;
  }
}
