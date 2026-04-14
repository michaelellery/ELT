import { clsx } from "clsx";
import type { CompareResult } from "../../lib/types.js";

type Indicator = "win" | "neutral" | "loss";

interface ComparisonRow {
  dimension: string;
  brightway: { value: string; indicator: Indicator };
  competitors: { name: string; value: string; indicator: Indicator }[];
}

const DEFAULT_DATA: ComparisonRow[] = [
  {
    dimension: "APR",
    brightway: { value: "35.99% fixed", indicator: "loss" },
    competitors: [
      { name: "Capital One Platinum", value: "28.99% variable", indicator: "win" },
      { name: "Credit One Visa", value: "~28.24%+", indicator: "win" },
    ],
  },
  {
    dimension: "Annual Fee",
    brightway: { value: "$0 – $89", indicator: "neutral" },
    competitors: [
      { name: "Capital One Platinum", value: "$0", indicator: "win" },
      { name: "Credit One Visa", value: "$75–$99/yr", indicator: "loss" },
    ],
  },
  {
    dimension: "Cash Back",
    brightway: { value: "1% all purchases", indicator: "win" },
    competitors: [
      { name: "Capital One Platinum", value: "None", indicator: "loss" },
      { name: "Credit One Visa", value: "1% (categories)", indicator: "neutral" },
    ],
  },
  {
    dimension: "No Deposit",
    brightway: { value: "✅ Unsecured", indicator: "win" },
    competitors: [
      { name: "Capital One Platinum", value: "❌ Secured", indicator: "loss" },
      { name: "Credit One Visa", value: "✅ Unsecured", indicator: "win" },
    ],
  },
  {
    dimension: "Bureau Reporting",
    brightway: { value: "All 3", indicator: "win" },
    competitors: [
      { name: "Capital One Platinum", value: "All 3", indicator: "win" },
      { name: "Credit One Visa", value: "All 3", indicator: "win" },
    ],
  },
  {
    dimension: "Graduation Path",
    brightway: { value: "Milestones → BrightWay+", indicator: "win" },
    competitors: [
      { name: "Capital One Platinum", value: "Manual review", indicator: "neutral" },
      { name: "Credit One Visa", value: "No defined path", indicator: "loss" },
    ],
  },
  {
    dimension: "Max Credit Limit",
    brightway: { value: "Up to $15,000", indicator: "win" },
    competitors: [
      { name: "Capital One Platinum", value: "≈ deposit amount", indicator: "neutral" },
      { name: "Credit One Visa", value: "Varies", indicator: "neutral" },
    ],
  },
  {
    dimension: "Foreign Txn Fee",
    brightway: { value: "1%", indicator: "win" },
    competitors: [
      { name: "Capital One Platinum", value: "0%", indicator: "win" },
      { name: "Credit One Visa", value: "3%", indicator: "loss" },
    ],
  },
];

function IndicatorIcon({ indicator }: { indicator: Indicator }) {
  if (indicator === "win") return <span className="text-[--success]" aria-label="Advantage">✅</span>;
  if (indicator === "loss") return <span className="text-[--error]" aria-label="Disadvantage">❌</span>;
  return <span className="text-[--warning]" aria-label="Neutral">⚠️</span>;
}

interface ComparisonTableProps {
  data?: CompareResult;
}

export function ComparisonTable({ data: _data }: ComparisonTableProps) {
  // Use default data for now (mock); real data comes from tool_result
  const rows = DEFAULT_DATA;
  const competitorNames = rows[0]?.competitors.map((c) => c.name) ?? [];

  const wins = rows.filter((r) => r.brightway.indicator === "win").length;
  const losses = rows.filter((r) => r.brightway.indicator === "loss").length;

  return (
    <div
      className="rounded-xl overflow-hidden shadow-sm max-w-full w-full"
      style={{ border: "1px solid var(--border-color)" }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: "var(--omf-navy)" }}>
        <span className="text-lg" aria-hidden="true">🆚</span>
        <h3 className="text-white font-semibold text-sm">Card Comparison</h3>
        <span className="ml-auto text-white/60 text-xs">
          BrightWay wins {wins}/{rows.length} categories
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          className="w-full text-sm border-collapse"
          aria-label="Credit card feature comparison"
        >
          <thead>
            <tr style={{ backgroundColor: "var(--gray-100)" }}>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-[--text-secondary] uppercase tracking-wide w-32"
              >
                Feature
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide"
                style={{ backgroundColor: "rgba(0,87,168,0.15)" }}
              >
                💳 BrightWay
              </th>
              {competitorNames.map((name) => (
                <th
                  key={name}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold text-[--text-secondary] uppercase tracking-wide"
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.dimension}
                className={clsx(
                  idx % 2 === 0 ? "bg-[--bg-surface]" : "",
                  idx % 2 !== 0 ? "bg-[--gray-50] dark:bg-[--dm-bg-page]" : "",
                )}
                style={{ borderTop: "1px solid var(--border-color)" }}
              >
                {/* Dimension label */}
                <td className="px-4 py-3 text-xs font-medium text-[--text-secondary]">
                  {row.dimension}
                </td>

                {/* BrightWay column (highlighted) */}
                <td
                  className="px-4 py-3"
                  style={{ backgroundColor: "rgba(0,87,168,0.04)" }}
                >
                  <div className="flex items-center gap-2">
                    <IndicatorIcon indicator={row.brightway.indicator} />
                    <span className="text-xs font-medium text-[--text-primary]">
                      {row.brightway.value}
                    </span>
                  </div>
                </td>

                {/* Competitor columns */}
                {row.competitors.map((comp) => (
                  <td key={comp.name} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <IndicatorIcon indicator={comp.indicator} />
                      <span className="text-xs text-[--text-primary]">{comp.value}</span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          {/* Verdict row */}
          <tfoot>
            <tr style={{ borderTop: "2px solid var(--border-color)", backgroundColor: "var(--gray-50)" }}>
              <td className="px-4 py-3 text-xs font-semibold text-[--text-secondary] uppercase">
                Verdict
              </td>
              <td
                className="px-4 py-3 text-xs font-semibold text-[--success]"
                style={{ backgroundColor: "rgba(5,150,105,0.05)" }}
              >
                {"⭐".repeat(4)} Best path for rebuilding credit
              </td>
              {competitorNames.map((name, i) => (
                <td key={name} className="px-4 py-3 text-xs text-[--text-secondary]">
                  {i === 0 ? "⭐⭐⭐ Lower APR, no cash back" : "⭐⭐⭐ OK alternative"}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary */}
      <div
        className="px-4 py-3 text-xs text-[--text-secondary]"
        style={{ borderTop: "1px solid var(--border-color)", backgroundColor: "var(--gray-50)" }}
      >
        BrightWay wins <strong>{wins}</strong> of {rows.length} categories •{" "}
        <strong>{losses}</strong> categories where competitors lead •{" "}
        Data as of April 2026
      </div>
    </div>
  );
}
