import { Moon, Sun, HelpCircle } from "lucide-react";
import type { Theme } from "../../lib/types.js";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-14 shrink-0"
      style={{ backgroundColor: "var(--omf-navy)" }}
      role="banner"
    >
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        {/* OMF Logo mark */}
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white font-bold text-sm shrink-0"
          aria-hidden="true"
        >
          OM
        </div>
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm sm:text-base leading-tight">
            BrightWay Assistant
          </span>
          <span className="text-white/60 text-xs hidden sm:block leading-none">
            OneMain Financial
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun size={18} aria-hidden="true" />
          ) : (
            <Moon size={18} aria-hidden="true" />
          )}
        </button>

        <button
          className="flex items-center justify-center w-8 h-8 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Help and information"
          onClick={() =>
            window.open("https://www.onemainfinancial.com/credit-cards/brightway", "_blank")
          }
        >
          <HelpCircle size={18} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
