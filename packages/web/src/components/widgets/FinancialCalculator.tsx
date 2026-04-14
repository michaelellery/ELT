import { clsx } from "clsx";
import { useCalculator } from "../../hooks/useCalculator.js";
import { formatCurrency } from "../../lib/formatters.js";
import type { CalcResultData } from "../../lib/types.js";

interface FinancialCalculatorProps {
  prefillResult?: CalcResultData;
  readOnly?: boolean;
}

function ResultRow({
  label,
  value,
  indicator,
  bold,
}: {
  label: string;
  value: string;
  indicator?: "positive" | "negative" | "warning" | "neutral";
  bold?: boolean;
}) {
  const icon =
    indicator === "positive" ? "✅" : indicator === "negative" ? "❌" : indicator === "warning" ? "⚠️" : "";

  return (
    <div
      className={clsx(
        "flex justify-between items-center py-1.5",
        bold && "font-semibold",
      )}
    >
      <span className="text-sm text-[--text-secondary]">{label}</span>
      <span
        className={clsx(
          "text-sm font-medium flex items-center gap-1.5",
          indicator === "positive" && "text-[--success]",
          indicator === "negative" && "text-[--error]",
          indicator === "warning" && "text-[--warning]",
          !indicator && "text-[--text-primary]",
        )}
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        {value}
      </span>
    </div>
  );
}

export function FinancialCalculator({ prefillResult: _prefillResult, readOnly }: FinancialCalculatorProps) {
  const { input, updateInput, result } = useCalculator();

  const annualFeeOptions = [
    { value: 0, label: "$0" },
    { value: 49, label: "$49" },
    { value: 75, label: "$75" },
    { value: 89, label: "$89" },
  ];

  const recBg =
    result.recommendation === "positive"
      ? "#f0fdf4"
      : result.recommendation === "negative"
        ? "#fef2f2"
        : "#fffbeb";

  const recBorder =
    result.recommendation === "positive"
      ? "var(--success)"
      : result.recommendation === "negative"
        ? "var(--error)"
        : "var(--warning)";

  return (
    <div
      className="rounded-xl shadow-md max-w-lg w-full overflow-hidden"
      style={{
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--bg-surface)",
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4"
        style={{
          backgroundColor: "var(--omf-navy)",
        }}
      >
        <h3 className="text-white font-semibold text-base flex items-center gap-2">
          <span aria-hidden="true">🧮</span> BrightWay Financial Calculator
        </h3>
        <p className="text-white/60 text-sm mt-0.5">
          Does this card make sense for you?
        </p>
      </div>

      {/* Inputs */}
      {!readOnly && (
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Monthly Spending */}
            <div>
              <label
                htmlFor="monthly-spending"
                className="block text-sm font-medium text-[--text-secondary] mb-1.5"
              >
                Monthly Spending
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--gray-500] text-sm">
                  $
                </span>
                <input
                  id="monthly-spending"
                  type="number"
                  min={0}
                  max={50000}
                  step={50}
                  value={input.monthlySpending}
                  onChange={(e) => updateInput("monthlySpending", Number(e.target.value))}
                  className={clsx(
                    "w-full pl-7 pr-3 py-2.5 text-sm rounded-lg",
                    "border border-[--border-color] bg-[--bg-input] text-[--text-primary]",
                    "focus:outline-none focus:border-[--omf-blue] focus:ring-2 focus:ring-[--omf-blue]/20",
                  )}
                />
              </div>
            </div>

            {/* Annual Fee */}
            <div>
              <label
                htmlFor="annual-fee"
                className="block text-sm font-medium text-[--text-secondary] mb-1.5"
              >
                Annual Fee Tier
              </label>
              <select
                id="annual-fee"
                value={input.annualFee}
                onChange={(e) => updateInput("annualFee", Number(e.target.value))}
                className={clsx(
                  "w-full px-3 py-2.5 text-sm rounded-lg",
                  "border border-[--border-color] bg-[--bg-input] text-[--text-primary]",
                  "focus:outline-none focus:border-[--omf-blue] focus:ring-2 focus:ring-[--omf-blue]/20",
                )}
              >
                {annualFeeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Carries balance toggle */}
          <div>
            <fieldset>
              <legend className="text-sm font-medium text-[--text-secondary] mb-2">
                Do you carry a balance month-to-month?
              </legend>
              <div className="flex gap-4">
                {["Yes", "No"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="carries-balance"
                      value={opt}
                      checked={input.carriesBalance === (opt === "Yes")}
                      onChange={() => updateInput("carriesBalance", opt === "Yes")}
                      className="text-[--omf-blue] focus:ring-[--omf-blue]"
                    />
                    <span className="text-sm text-[--text-primary]">{opt}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Average balance (conditional) */}
          {input.carriesBalance && (
            <div>
              <label
                htmlFor="average-balance"
                className="block text-sm font-medium text-[--text-secondary] mb-1.5"
              >
                Average Monthly Balance Carried
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--gray-500] text-sm">
                  $
                </span>
                <input
                  id="average-balance"
                  type="number"
                  min={0}
                  max={15000}
                  step={50}
                  value={input.averageBalance}
                  onChange={(e) => updateInput("averageBalance", Number(e.target.value))}
                  className={clsx(
                    "w-full pl-7 pr-3 py-2.5 text-sm rounded-lg",
                    "border border-[--border-color] bg-[--bg-input] text-[--text-primary]",
                    "focus:outline-none focus:border-[--omf-blue] focus:ring-2 focus:ring-[--omf-blue]/20",
                  )}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border-color)" }} />

      {/* Results */}
      <div className="px-6 py-4">
        <h4 className="text-sm font-semibold text-[--text-primary] flex items-center gap-1.5 mb-3">
          <span aria-hidden="true">📊</span> Your Annual Summary
        </h4>

        <div className="flex flex-col">
          <ResultRow
            label="Cash Back Earned"
            value={formatCurrency(result.annualCashBack)}
            indicator="positive"
          />
          <ResultRow label="Annual Fee Cost" value={`-${formatCurrency(result.annualFee)}`} />
          <div style={{ borderTop: "1px solid var(--border-color)", margin: "4px 0" }} />
          <ResultRow
            label="Net Benefit"
            value={`${result.netBenefit >= 0 ? "+" : ""}${formatCurrency(result.netBenefit)}`}
            indicator={result.netBenefit >= 0 ? "positive" : "negative"}
            bold
          />
        </div>

        {/* Interest cost warning */}
        {result.interestCost !== undefined && result.trueNet !== undefined && (
          <div
            className="mt-4 p-3 rounded-lg"
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
            }}
          >
            <p className="text-sm font-medium text-amber-800 mb-2">
              ⚠️ If carrying a ${input.averageBalance.toLocaleString()} balance:
            </p>
            <ResultRow
              label="Annual Interest Cost"
              value={`~${formatCurrency(result.interestCost)}`}
              indicator="warning"
            />
            <div style={{ borderTop: "1px solid #fde68a", margin: "4px 0" }} />
            <ResultRow
              label="True Net After Interest"
              value={`${result.trueNet >= 0 ? "+" : ""}${formatCurrency(result.trueNet)}`}
              indicator={result.trueNet >= 0 ? "positive" : "negative"}
              bold
            />
            <p className="text-xs text-amber-700 mt-2">
              💡 Pay in full each month to avoid interest!
            </p>
          </div>
        )}

        {/* Recommendation */}
        <div
          className="mt-4 p-3 rounded-lg text-sm"
          style={{
            backgroundColor: recBg,
            border: `1px solid ${recBorder}`,
          }}
        >
          <p className="font-medium" style={{ color: recBorder }}>
            {result.recommendation === "positive"
              ? "✅ This card works for you!"
              : result.recommendation === "cautious"
                ? "⚠️ It's a close call"
                : "❌ Not recommended at this spending level"}
          </p>
          <p className="text-[--text-secondary] mt-1 text-xs">{result.explanation}</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className="px-6 py-3 text-xs text-[--text-secondary]"
        style={{ borderTop: "1px solid var(--border-color)", backgroundColor: "var(--gray-50)" }}
      >
        Estimates based on 35.99% APR, 1% cash back. Rates as of April 2026. Verify at{" "}
        <a
          href="https://onemainfinancial.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[--omf-blue] underline"
        >
          onemainfinancial.com
        </a>
      </div>
    </div>
  );
}
