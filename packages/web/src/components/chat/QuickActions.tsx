import { clsx } from "clsx";
import type { QuickAction } from "../../lib/types.js";

const DEFAULT_ACTIONS: QuickAction[] = [
  { emoji: "💳", label: "What is BrightWay?", message: "What is the BrightWay credit card?" },
  { emoji: "📈", label: "How do Milestones work?", message: "How does the Milestone reward system work?" },
  { emoji: "🆚", label: "Compare to competitors", message: "Compare BrightWay to competitor credit cards" },
  { emoji: "🧮", label: "Should I get this card?", message: "Should I get the BrightWay card? Help me calculate." },
  { emoji: "⚠️", label: "What are the risks?", message: "What are the risks and downsides of the BrightWay card?" },
  { emoji: "💰", label: "Show me the fees", message: "Show me all the fees for the BrightWay card" },
];

interface QuickActionsProps {
  onSelect: (message: string) => void;
  actions?: QuickAction[];
  disabled?: boolean;
}

export function QuickActions({
  onSelect,
  actions = DEFAULT_ACTIONS,
  disabled,
}: QuickActionsProps) {
  return (
    <div
      className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar shrink-0"
      role="group"
      aria-label="Quick conversation starters"
    >
      {actions.map((action) => (
        <button
          key={action.message}
          role="button"
          disabled={disabled}
          onClick={() => onSelect(action.message)}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0",
            "border-2 border-[--omf-blue] text-white font-semibold",
            "bg-[--omf-blue] dark:bg-[--omf-blue] dark:text-white dark:border-[--omf-blue-light]",
            "transition-all duration-150 shadow-sm",
            "hover:bg-[--omf-navy] hover:border-[--omf-navy] hover:text-white dark:hover:bg-[--omf-navy] dark:hover:text-white",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--omf-blue] focus-visible:ring-offset-1",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          )}
          aria-label={`Ask: ${action.label}`}
        >
          <span aria-hidden="true">{action.emoji}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
