import { forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          // Base
          "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[--omf-blue] focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Size
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-6 py-3 text-base",
          // Variant
          variant === "primary" &&
            "bg-[--omf-blue] text-white hover:bg-[--omf-blue-light] active:scale-95",
          variant === "secondary" &&
            "bg-white text-[--omf-blue] border border-[--omf-blue] hover:bg-[--omf-blue] hover:text-white dark:bg-transparent dark:text-[--omf-blue-light] dark:border-[--omf-blue-light]",
          variant === "ghost" &&
            "bg-transparent text-[--gray-700] hover:bg-[--gray-100] dark:text-[--dm-text-secondary] dark:hover:bg-[--dm-bg-surface]",
          variant === "danger" &&
            "bg-[--error] text-white hover:opacity-90 active:scale-95",
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading…
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
