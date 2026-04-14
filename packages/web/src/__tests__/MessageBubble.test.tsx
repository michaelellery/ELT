// packages/web/src/__tests__/MessageBubble.test.tsx
// Tests for MessageBubble component — ELT-12

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// TODO (Dev 1): Import actual component when ELT-9/ELT-15 is complete
// import MessageBubble from "../components/chat/MessageBubble";

interface MockMessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const MockMessageBubble = ({ role, content, isStreaming }: MockMessageBubbleProps) => (
  <div
    data-testid={`message-bubble-${role}`}
    data-role={role}
    className={role === "user" ? "text-right bg-blue-600" : "text-left bg-white"}
  >
    {role === "assistant" && <span data-testid="bot-avatar">🐾</span>}
    <div data-testid="message-content">{content}</div>
    {isStreaming && <span data-testid="cursor-blink" className="cursor-blink">▋</span>}
  </div>
);

describe("MessageBubble", () => {
  describe("User message variant", () => {
    it("renders user message", () => {
      render(<MockMessageBubble role="user" content="What is BrightWay?" />);
      expect(screen.getByTestId("message-bubble-user")).toBeTruthy();
    });

    it("displays user message content", () => {
      render(<MockMessageBubble role="user" content="What is the APR?" />);
      expect(screen.getByText("What is the APR?")).toBeTruthy();
    });

    it("user bubble has right-aligned style indicator", () => {
      render(<MockMessageBubble role="user" content="Hello" />);
      const bubble = screen.getByTestId("message-bubble-user");
      expect(bubble.className).toContain("text-right");
    });

    it("user bubble does not show bot avatar", () => {
      render(<MockMessageBubble role="user" content="Hello" />);
      expect(screen.queryByTestId("bot-avatar")).toBeNull();
    });
  });

  describe("Assistant message variant", () => {
    it("renders assistant message", () => {
      render(<MockMessageBubble role="assistant" content="I can help with that!" />);
      expect(screen.getByTestId("message-bubble-assistant")).toBeTruthy();
    });

    it("displays assistant message content", () => {
      const content = "The BrightWay card has a 35.99% APR.";
      render(<MockMessageBubble role="assistant" content={content} />);
      expect(screen.getByText(content)).toBeTruthy();
    });

    it("assistant bubble shows bot avatar", () => {
      render(<MockMessageBubble role="assistant" content="Hello!" />);
      expect(screen.getByTestId("bot-avatar")).toBeTruthy();
    });

    it("assistant bubble has left-aligned style indicator", () => {
      render(<MockMessageBubble role="assistant" content="Hello!" />);
      const bubble = screen.getByTestId("message-bubble-assistant");
      expect(bubble.className).toContain("text-left");
    });
  });

  describe("Streaming state", () => {
    it("shows cursor blink when streaming", () => {
      render(<MockMessageBubble role="assistant" content="Typing..." isStreaming={true} />);
      expect(screen.getByTestId("cursor-blink")).toBeTruthy();
    });

    it("hides cursor blink when not streaming", () => {
      render(<MockMessageBubble role="assistant" content="Done" isStreaming={false} />);
      expect(screen.queryByTestId("cursor-blink")).toBeNull();
    });

    it("streaming defaults to false (no cursor shown)", () => {
      render(<MockMessageBubble role="assistant" content="Complete message" />);
      expect(screen.queryByTestId("cursor-blink")).toBeNull();
    });
  });

  describe("Content handling", () => {
    it("renders empty content without crashing", () => {
      render(<MockMessageBubble role="assistant" content="" />);
      expect(screen.getByTestId("message-bubble-assistant")).toBeTruthy();
    });

    it("renders long content", () => {
      const longContent = "A".repeat(500);
      render(<MockMessageBubble role="assistant" content={longContent} />);
      expect(screen.getByText(longContent)).toBeTruthy();
    });
  });

  // TODO (Dev 1): Once MessageBubble is implemented, add tests for:
  // - react-markdown rendering of bot responses
  // - Inline widget rendering for tool results
  // - FinancialCalculator widget embedded in message
  // - ComparisonTable widget embedded in message

  it.todo("renders markdown formatting in bot messages");
  it.todo("renders FinancialCalculator widget for calculate_financial_fitness tool results");
  it.todo("renders ComparisonTable widget for compare_cards tool results");
  it.todo("renders MilestoneTracker widget for track_milestone_progress tool results");
});
