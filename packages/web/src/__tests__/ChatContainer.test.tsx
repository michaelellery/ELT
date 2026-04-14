// packages/web/src/__tests__/ChatContainer.test.tsx
// Tests for ChatContainer component — ELT-12

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// TODO (Dev 1): Import actual component when ELT-9 is complete
// import ChatContainer from "../components/chat/ChatContainer";

// Minimal stub for testing structure
const MockChatContainer = () => (
  <div data-testid="chat-container">
    <header data-testid="chat-header">
      <span>BrightWay Assistant</span>
    </header>
    <main data-testid="message-list">
      {/* Messages render here */}
    </main>
    <div data-testid="quick-actions">
      <button>💳 What is BrightWay?</button>
      <button>📈 How do Milestones work?</button>
    </div>
    <footer data-testid="input-bar">
      <input placeholder="Ask me anything about BrightWay..." />
      <button type="submit">Send</button>
    </footer>
  </div>
);

describe("ChatContainer", () => {
  it("renders without crashing", () => {
    render(<MockChatContainer />);
    expect(screen.getByTestId("chat-container")).toBeTruthy();
  });

  it("renders the header with title", () => {
    render(<MockChatContainer />);
    expect(screen.getByTestId("chat-header")).toBeTruthy();
    expect(screen.getByText("BrightWay Assistant")).toBeTruthy();
  });

  it("renders the message list area", () => {
    render(<MockChatContainer />);
    expect(screen.getByTestId("message-list")).toBeTruthy();
  });

  it("renders the input bar", () => {
    render(<MockChatContainer />);
    expect(screen.getByTestId("input-bar")).toBeTruthy();
    expect(screen.getByPlaceholderText("Ask me anything about BrightWay...")).toBeTruthy();
  });

  it("renders quick action chips", () => {
    render(<MockChatContainer />);
    expect(screen.getByTestId("quick-actions")).toBeTruthy();
    expect(screen.getByText("💳 What is BrightWay?")).toBeTruthy();
    expect(screen.getByText("📈 How do Milestones work?")).toBeTruthy();
  });

  // TODO (Dev 1): Once ChatContainer is implemented, add integration tests:
  // - Clicking quick action sends the message
  // - Input bar accepts text
  // - Submit sends message via useChat
  // - Streaming messages show typing indicator
  // - Desktop layout shows sidebar at ≥1024px
  // - Mobile layout hides sidebar at <640px

  it.todo("sends message when quick action chip is clicked");
  it.todo("shows typing indicator while streaming");
  it.todo("displays error state when API fails");
  it.todo("shows sidebar on desktop layout");
  it.todo("hides sidebar on mobile layout");
});
