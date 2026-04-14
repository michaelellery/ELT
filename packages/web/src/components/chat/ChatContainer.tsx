import { useCallback } from "react";
import { MessageList } from "./MessageList.js";
import { QuickActions } from "./QuickActions.js";
import { InputBar } from "./InputBar.js";
import { Header } from "../layout/Header.js";
import { InfoSidebar } from "../layout/InfoSidebar.js";
import { useChat } from "../../hooks/useChat.js";
import { useTheme } from "../../hooks/useTheme.js";

export function ChatContainer() {
  const { messages, isStreaming, sendMessage, error } = useChat();
  const { theme, toggleTheme } = useTheme();

  const handleSend = useCallback(
    (text: string) => {
      void sendMessage(text);
    },
    [sendMessage],
  );

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "var(--bg-page)" }}>
      {/* Skip link for accessibility */}
      <a href="#chat-messages" className="skip-link">
        Skip to chat messages
      </a>

      {/* Header */}
      <Header theme={theme} onToggleTheme={toggleTheme} />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Info Sidebar — desktop only */}
        <InfoSidebar onSendMessage={handleSend} />

        {/* Chat Panel */}
        <main
          className="flex flex-col flex-1 overflow-hidden"
          aria-label="Chat with BrightWay assistant"
        >
          {/* Error banner */}
          {error && (
            <div
              className="px-4 py-2 text-sm font-medium"
              role="alert"
              aria-live="assertive"
              style={{
                backgroundColor: "#FEF2F2",
                color: "var(--error)",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              ⚠️ {error} —{" "}
              <button
                className="underline hover:no-underline"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          )}

          {/* Messages */}
          <MessageList messages={messages} isStreaming={isStreaming} />

          {/* Quick actions */}
          <QuickActions onSelect={handleSend} disabled={isStreaming} />

          {/* Input bar */}
          <InputBar
            onSend={handleSend}
            disabled={isStreaming}
          />
        </main>
      </div>
    </div>
  );
}
