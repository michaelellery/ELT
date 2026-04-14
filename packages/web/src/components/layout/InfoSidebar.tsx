import { Calculator } from "lucide-react";
import { Button } from "../ui/Button.js";

interface InfoSidebarProps {
  onSendMessage: (msg: string) => void;
}

export function InfoSidebar({ onSendMessage }: InfoSidebarProps) {
  return (
    <aside
      className="hidden lg:flex flex-col w-80 shrink-0 border-r border-[--border-color] bg-[--bg-surface] overflow-y-auto"
      aria-label="BrightWay card information"
    >
      <div className="p-4 flex flex-col gap-4">
        {/* Card Summary */}
        <div className="rounded-xl border border-[--border-color] overflow-hidden">
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ backgroundColor: "var(--omf-navy)" }}
          >
            <span className="text-xl" aria-hidden="true">
              💳
            </span>
            <span className="text-white font-semibold text-sm">BrightWay Mastercard</span>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {[
              { label: "APR", value: "35.99% fixed" },
              { label: "Cash Back", value: "1% on all purchases" },
              { label: "Annual Fee", value: "$0 – $89" },
              { label: "Starting Limit", value: "Up to $1,500" },
              { label: "Foreign Txn", value: "1% (avg is 3%)" },
              { label: "Bureau Report", value: "All 3 bureaus" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: "var(--gray-500)" }}>{label}</span>
                <span className="font-semibold text-[--text-primary]">{value}</span>
              </div>
            ))}
          </div>
          <div className="px-4 pb-3 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 text-xs"
              onClick={() => onSendMessage("How do Milestones work?")}
            >
              📈 Milestones
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 text-xs"
              onClick={() => onSendMessage("Compare BrightWay to competitors")}
            >
              🆚 Compare
            </Button>
          </div>
        </div>

        {/* Milestone Preview */}
        <div className="rounded-xl border border-[--border-color] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base" aria-hidden="true">
              📊
            </span>
            <span className="font-semibold text-sm text-[--text-primary]">Milestone Progress</span>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1 mb-3" aria-label="6 payments per milestone">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div
                  className={`w-3 h-3 rounded-full ${i < 3 ? "bg-[--omf-blue]" : "bg-[--gray-300] dark:bg-[--dm-border]"}`}
                />
                {i < 5 && (
                  <div
                    className={`flex-1 h-0.5 ${i < 2 ? "bg-[--omf-blue]" : "bg-[--gray-300] dark:bg-[--dm-border]"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-[--gray-200] dark:bg-[--dm-border] rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full"
              style={{
                width: "50%",
                background: "linear-gradient(to right, var(--omf-blue), var(--brightway-teal))",
              }}
            />
          </div>

          <p className="text-xs text-[--text-secondary]">
            3 of 6 payments complete — Next: choose APR cut or limit increase
          </p>

          <Button
            size="sm"
            variant="ghost"
            className="mt-2 w-full text-xs"
            onClick={() => onSendMessage("Show me the Milestone progress tracker")}
          >
            View Full Tracker →
          </Button>
        </div>

        {/* Quick Calculator */}
        <div className="rounded-xl border border-[--border-color] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator size={16} className="text-[--omf-blue]" aria-hidden="true" />
            <span className="font-semibold text-sm text-[--text-primary]">Quick Calculator</span>
          </div>
          <p className="text-xs text-[--text-secondary] mb-3">
            Find out if BrightWay makes financial sense for your spending habits.
          </p>
          <Button
            size="sm"
            variant="primary"
            className="w-full"
            onClick={() => onSendMessage("Should I get the BrightWay card?")}
          >
            🧮 Try Calculator
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-[--text-secondary] text-center px-2">
          Rates as of April 2026. Always verify at{" "}
          <a
            href="https://onemainfinancial.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[--omf-blue] underline"
          >
            onemainfinancial.com
          </a>
        </p>
      </div>
    </aside>
  );
}
