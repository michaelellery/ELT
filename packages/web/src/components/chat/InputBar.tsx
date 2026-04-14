import { useState, useRef, useCallback } from "react";
import { Send } from "lucide-react";
import { clsx } from "clsx";

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InputBar({
  onSend,
  disabled,
  placeholder = "Ask anything about BrightWay...",
}: InputBarProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-grow textarea
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const isEmpty = !value.trim();

  return (
    <div
      className="flex items-end gap-2 px-4 py-3 border-t border-[--border-color] shrink-0"
      style={{ backgroundColor: "var(--bg-surface)" }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        maxLength={2000}
        className={clsx(
          "flex-1 resize-none rounded-xl px-4 py-2.5 text-sm leading-relaxed",
          "border border-[--border-color] bg-[--bg-input] text-[--text-primary]",
          "placeholder:text-[--gray-500]",
          "focus:outline-none focus:border-[--omf-blue] focus:ring-2 focus:ring-[--omf-blue]/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-150",
          "min-h-[40px] max-h-[120px]",
        )}
        aria-label="Type your message to BrightWay assistant"
        aria-describedby="input-hint"
        style={{ height: "40px" }}
      />
      <p id="input-hint" className="sr-only">
        Press Enter to send, Shift+Enter for a new line
      </p>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={disabled || isEmpty}
        className={clsx(
          "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150 shrink-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--omf-blue] focus-visible:ring-offset-2",
          !isEmpty && !disabled
            ? "bg-[--omf-blue] text-white hover:bg-[--omf-blue-light] active:scale-95"
            : "bg-[--gray-300] text-[--gray-500] cursor-not-allowed dark:bg-[--dm-border]",
        )}
        aria-label="Send message"
      >
        <Send size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
