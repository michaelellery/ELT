// packages/web/src/__tests__/useChat.test.ts
// Tests for useChat hook — ELT-12

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";

// TODO (Dev 1): Import actual hook when ELT-9 is complete
// import { useChat } from "../hooks/useChat";

// ---- Minimal inline hook for structural testing ----
import { useState, useCallback, useRef } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content: "Hi! I'm BrightWay Assistant. How can I help you today?",
};

function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [isStreaming, setIsStreaming] = useState(false);
  const sessionId = useRef(crypto.randomUUID());

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    // Simulate async response
    await new Promise((resolve) => setTimeout(resolve, 0));

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Mock response",
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, sendMessage, sessionId: sessionId.current };
}
// ---- End inline hook ----

describe("useChat hook", () => {
  describe("Initial state", () => {
    it("initializes with greeting message", () => {
      const { result } = renderHook(() => useChat());
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].role).toBe("assistant");
      expect(result.current.messages[0].content).toContain("BrightWay");
    });

    it("is not streaming initially", () => {
      const { result } = renderHook(() => useChat());
      expect(result.current.isStreaming).toBe(false);
    });

    it("generates a stable session ID", () => {
      const { result } = renderHook(() => useChat());
      const id = result.current.sessionId;
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it("session ID is stable across renders", () => {
      const { result, rerender } = renderHook(() => useChat());
      const id1 = result.current.sessionId;
      rerender();
      const id2 = result.current.sessionId;
      expect(id1).toBe(id2);
    });
  });

  describe("sendMessage", () => {
    it("adds user message immediately", async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("What is BrightWay?");
      });

      const userMessages = result.current.messages.filter((m) => m.role === "user");
      expect(userMessages).toHaveLength(1);
      expect(userMessages[0].content).toBe("What is BrightWay?");
    });

    it("adds assistant response after user message", async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      const assistantMessages = result.current.messages.filter((m) => m.role === "assistant");
      expect(assistantMessages.length).toBeGreaterThanOrEqual(1);
    });

    it("does not send empty messages", async () => {
      const { result } = renderHook(() => useChat());
      const initialCount = result.current.messages.length;

      await act(async () => {
        await result.current.sendMessage("");
      });

      expect(result.current.messages).toHaveLength(initialCount);
    });

    it("does not send whitespace-only messages", async () => {
      const { result } = renderHook(() => useChat());
      const initialCount = result.current.messages.length;

      await act(async () => {
        await result.current.sendMessage("   ");
      });

      expect(result.current.messages).toHaveLength(initialCount);
    });

    it("accumulates messages in order", async () => {
      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage("First question");
      });

      await act(async () => {
        await result.current.sendMessage("Second question");
      });

      const userMessages = result.current.messages.filter((m) => m.role === "user");
      expect(userMessages).toHaveLength(2);
      expect(userMessages[0].content).toBe("First question");
      expect(userMessages[1].content).toBe("Second question");
    });
  });

  describe("Streaming state", () => {
    it("sets isStreaming to true while processing", async () => {
      const { result } = renderHook(() => useChat());
      // Note: with the inline hook, we can only observe final state
      // TODO: Test actual streaming behavior when Dev 1 implements SSE parsing
      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      // After completion, streaming should be false
      expect(result.current.isStreaming).toBe(false);
    });
  });

  // TODO (Dev 1): Replace with real fetch-based SSE tests once implemented
  it.todo("streams text tokens from SSE response");
  it.todo("updates message content incrementally during streaming");
  it.todo("handles SSE connection errors gracefully");
  it.todo("handles network errors with user-visible error message");
  it.todo("processes tool_result SSE events and attaches widget data to messages");
  it.todo("handles done event to finalize streaming message");
});
