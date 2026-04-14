import { useState, useRef, useCallback, useEffect } from "react";
import { streamChat } from "../lib/api.js";
import type { ChatMessage, ToolResultData } from "../lib/types.js";

const GREETING_MESSAGE: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content: `👋 Hi! I'm your **BrightWay** assistant from OneMain Financial.\n\nI can answer questions about the BrightWay credit card, help you calculate if it makes sense for your situation, or compare it to other cards.\n\nWhat would you like to know?`,
  timestamp: new Date(),
};

// Mock SSE for when the backend isn't available yet
async function* mockStream(message: string): AsyncGenerator<{
  type: "text" | "tool_result" | "done";
  text?: string;
  name?: string;
  result?: Record<string, unknown>;
}> {
  const lc = message.toLowerCase();

  let response = "I'd be happy to help you with that! ";

  if (lc.includes("apr") || lc.includes("rate") || lc.includes("interest")) {
    response =
      "The BrightWay card has a **35.99% fixed APR** to start. The good news? The **Milestone system** lets you lower it — every 6 on-time payments earns you a reward, and one option is an APR reduction. The floor is **19.99%**.";
  } else if (lc.includes("milestone")) {
    response =
      "Great question! The **Milestone system** rewards you for on-time payments:\n\n- Every **6 consecutive on-time payments** = 1 Milestone\n- Each Milestone lets you choose: **APR decrease** OR **credit limit increase**\n- After **4 Milestones**, you can graduate to **BrightWay+** (no annual fee!)\n\n⚠️ Note: A late payment resets your progress, so consistency is key.";
    yield { type: "tool_result", name: "track_milestone_progress", result: { mock: true } };
  } else if (lc.includes("compar") || lc.includes("competitor") || lc.includes("vs")) {
    response =
      "Here's how BrightWay stacks up against the competition:";
    yield { type: "tool_result", name: "compare_cards", result: { mock: true } };
  } else if (lc.includes("calculator") || lc.includes("should i") || lc.includes("worth")) {
    response =
      "Let me help you figure out if BrightWay makes financial sense for you!";
    yield { type: "tool_result", name: "calculate_financial_fitness", result: { mock: true } };
  } else if (lc.includes("fee")) {
    response =
      "Here's the full fee breakdown for BrightWay:\n\n| Fee | Amount |\n|-----|--------|\n| Annual Fee | $0 – $89 (varies) |\n| Foreign Transaction | 1% (industry avg is 3%) |\n| Cash Advance | See cardholder agreement |\n| Late Payment | Standard |\n\n💡 The **BrightWay+** card (earned after 4 Milestones) has **no annual fee**.";
  } else if (lc.includes("brightway") || lc.includes("what is") || lc.includes("tell me")) {
    response =
      "The **BrightWay Mastercard** is OneMain Financial's credit-building card designed for people with fair or poor credit. Key highlights:\n\n✅ **No security deposit** required\n✅ **1% cash back** on all purchases\n✅ **Reports to all 3 credit bureaus**\n✅ **Milestone rewards** for on-time payments\n✅ **Low 1% foreign transaction fee** (vs. 3% industry average)\n\n⚠️ **Honest caveats:** 35.99% starting APR, annual fee up to $89, and it's invite-only (you need an offer code to apply).";
    yield { type: "tool_result", name: "get_product_info", result: { mock: true } };
  } else if (lc.includes("risk") || lc.includes("downside") || lc.includes("bad")) {
    response =
      "Honest risks of the BrightWay card:\n\n❌ **High starting APR (35.99%)** — carrying a balance is expensive\n❌ **Annual fee up to $89** — make sure cash back covers it\n❌ **Low starting credit limit** — could be as low as $300\n❌ **Invite-only** — you need an offer code to apply\n❌ **Late payment resets Milestone progress** — one slip-up can cost you\n\nThe card is designed for credit building, not for carrying balances. Pay in full every month!";
  } else {
    response =
      "I'm here to help with anything about the BrightWay credit card! You can ask me about:\n\n- 💳 Card features and rates\n- 📈 The Milestone reward system\n- 🆚 Comparison to competitors\n- 🧮 Whether this card makes financial sense for you\n- ⚠️ Risks and honest caveats\n\nWhat would you like to explore?";
  }

  // Simulate streaming word by word
  const words = response.split(" ");
  for (const word of words) {
    yield { type: "text", text: word + " " };
    await new Promise((r) => setTimeout(r, 30));
  }

  yield { type: "done" };
}

export interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  error: string | null;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING_MESSAGE]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = useRef(crypto.randomUUID());
  const abortRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    setError(null);

    // Add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    // Create placeholder for assistant response
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
      toolResults: [],
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Determine if we should use real API or mock
      const useMock = !import.meta.env["VITE_API_URL"];

      const stream = useMock
        ? mockStream(text)
        : streamChat(sessionId.current, text, controller.signal);

      const toolResults: ToolResultData[] = [];

      for await (const event of stream) {
        if (controller.signal.aborted) break;

        if (event.type === "text" && event.text) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + event.text }
                : m,
            ),
          );
        } else if (event.type === "tool_result" && event.name && event.result) {
          toolResults.push({
            toolName: event.name,
            result: event.result,
          });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, toolResults: [...toolResults] } : m,
            ),
          );
        } else if (event.type === "error") {
          throw new Error(event.message ?? "Stream error");
        }
      }

      // Finalize message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m,
        ),
      );
    } catch (err) {
      if ((err as Error).name === "AbortError") return;

      const errMsg = (err as Error).message ?? "Something went wrong";
      setError(errMsg);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "😔 I'm having trouble connecting right now. Please try again.",
                isStreaming: false,
                error: true,
              }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  const clearMessages = useCallback(() => {
    setMessages([GREETING_MESSAGE]);
    setError(null);
    sessionId.current = crypto.randomUUID();
  }, []);

  return { messages, isStreaming, sendMessage, clearMessages, error };
}
