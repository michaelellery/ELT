export function TypingIndicator() {
  return (
    <div
      className="flex items-start gap-3 px-4"
      role="status"
      aria-label="BrightWay is typing"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Bot Avatar */}
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-white text-xs font-bold"
        style={{ backgroundColor: "var(--omf-navy)" }}
        aria-hidden="true"
      >
        BW
      </div>

      {/* Typing bubble */}
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-[2px_12px_12px_12px] shadow-sm"
        style={{
          backgroundColor: "var(--chat-bot-bg)",
          border: "1px solid var(--border-color)",
          minHeight: "44px",
        }}
      >
        <span className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: "var(--omf-blue)" }} />
        <span className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: "var(--omf-blue)" }} />
        <span className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: "var(--omf-blue)" }} />
      </div>
    </div>
  );
}
