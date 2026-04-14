import { useState } from "react";
import { clsx } from "clsx";
import type { MilestoneSnapshot } from "../../lib/types.js";

interface MilestoneTrackerProps {
  data?: { milestones: MilestoneSnapshot[]; currentPayment?: number };
}

const DEFAULT_MILESTONES: MilestoneSnapshot[] = [
  {
    milestoneNumber: 1,
    paymentCount: 6,
    apr: 33.99,
    creditLimit: 1300,
    rewardType: "apr_decrease",
  },
  {
    milestoneNumber: 2,
    paymentCount: 12,
    apr: 33.99,
    creditLimit: 2000,
    rewardType: "credit_limit_increase",
  },
  {
    milestoneNumber: 3,
    paymentCount: 18,
    apr: 31.99,
    creditLimit: 2000,
    rewardType: "apr_decrease",
  },
  {
    milestoneNumber: 4,
    paymentCount: 24,
    apr: 31.99,
    creditLimit: 3000,
    rewardType: "credit_limit_increase",
  },
];

const STARTING = { apr: 35.99, creditLimit: 1000 };
const PAYMENTS_PER_MILESTONE = 6;

export function MilestoneTracker({ data }: MilestoneTrackerProps) {
  const [currentPayment, setCurrentPayment] = useState(data?.currentPayment ?? 3);
  const milestones = data?.milestones ?? DEFAULT_MILESTONES;

  const completedMilestones = Math.floor(currentPayment / PAYMENTS_PER_MILESTONE);
  const paymentsInCurrentMilestone = currentPayment % PAYMENTS_PER_MILESTONE;
  const progressPercent = (paymentsInCurrentMilestone / PAYMENTS_PER_MILESTONE) * 100;

  const currentApr =
    completedMilestones > 0
      ? milestones[completedMilestones - 1]?.apr ?? STARTING.apr
      : STARTING.apr;

  const currentLimit =
    completedMilestones > 0
      ? milestones[completedMilestones - 1]?.creditLimit ?? STARTING.creditLimit
      : STARTING.creditLimit;

  const isGraduated = completedMilestones >= 4;

  return (
    <div
      className="rounded-xl overflow-hidden shadow-sm max-w-md w-full"
      style={{ border: "1px solid var(--border-color)" }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: "var(--omf-navy)" }}>
        <span className="text-lg" aria-hidden="true">📈</span>
        <h3 className="text-white font-semibold text-sm">Milestone Progress</h3>
        {isGraduated && (
          <span className="ml-auto bg-[--brightway-gold] text-white text-xs font-bold px-2 py-0.5 rounded-full">
            🎉 Graduated!
          </span>
        )}
      </div>

      {/* Current stats */}
      <div
        className="px-4 py-4"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        <div className="flex gap-4 mb-4">
          <div className="flex-1 text-center p-3 rounded-lg" style={{ backgroundColor: "var(--gray-50)", border: "1px solid var(--border-color)" }}>
            <p className="text-xs text-[--text-secondary] mb-1">Current APR</p>
            <p className="text-lg font-bold text-[--omf-blue]">{currentApr.toFixed(2)}%</p>
            <p className="text-xs text-[--text-secondary]">Floor: 19.99%</p>
          </div>
          <div className="flex-1 text-center p-3 rounded-lg" style={{ backgroundColor: "var(--gray-50)", border: "1px solid var(--border-color)" }}>
            <p className="text-xs text-[--text-secondary] mb-1">Credit Limit</p>
            <p className="text-lg font-bold text-[--success]">${currentLimit.toLocaleString()}</p>
            <p className="text-xs text-[--text-secondary]">Max: $15,000</p>
          </div>
        </div>

        {/* Payment progress within current milestone */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-[--text-secondary] mb-1.5">
            <span>Progress to Milestone {completedMilestones + 1}</span>
            <span>{paymentsInCurrentMilestone} of {PAYMENTS_PER_MILESTONE} payments</span>
          </div>

          {/* Dot tracker */}
          <div
            className="flex items-center gap-1 mb-3"
            role="progressbar"
            aria-valuenow={paymentsInCurrentMilestone}
            aria-valuemin={0}
            aria-valuemax={PAYMENTS_PER_MILESTONE}
            aria-label={`${paymentsInCurrentMilestone} of ${PAYMENTS_PER_MILESTONE} payments complete`}
          >
            {Array.from({ length: PAYMENTS_PER_MILESTONE }).map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div
                  className={clsx(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    i < paymentsInCurrentMilestone
                      ? "bg-[--omf-blue]"
                      : i === paymentsInCurrentMilestone
                        ? "bg-[--brightway-teal] ring-2 ring-[--brightway-teal] ring-offset-1"
                        : "bg-[--gray-300] dark:bg-[--dm-border]",
                  )}
                />
                {i < PAYMENTS_PER_MILESTONE - 1 && (
                  <div
                    className={clsx(
                      "flex-1 h-0.5 transition-all duration-300",
                      i < paymentsInCurrentMilestone - 1
                        ? "bg-[--omf-blue]"
                        : "bg-[--gray-300] dark:bg-[--dm-border]",
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-[--gray-200] dark:bg-[--dm-border] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(to right, var(--omf-blue), var(--brightway-teal))",
              }}
            />
          </div>
        </div>

        {/* Payment slider for demo */}
        <div className="mb-4">
          <label htmlFor="payment-slider" className="text-xs text-[--text-secondary]">
            Simulate payments (demo):
          </label>
          <input
            id="payment-slider"
            type="range"
            min={0}
            max={24}
            value={currentPayment}
            onChange={(e) => setCurrentPayment(Number(e.target.value))}
            className="w-full mt-1 accent-[--omf-blue]"
          />
          <div className="flex justify-between text-xs text-[--text-secondary] mt-0.5">
            <span>0</span>
            <span className="font-medium">{currentPayment} payments ({completedMilestones} milestones)</span>
            <span>24</span>
          </div>
        </div>

        {/* Milestone journey */}
        <div>
          <p className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wide mb-3">
            Milestone Journey
          </p>
          <div className="flex flex-col gap-2">
            {milestones.map((m, idx) => {
              const achieved = completedMilestones > idx;
              const isCurrent = completedMilestones === idx;

              return (
                <div
                  key={m.milestoneNumber}
                  className={clsx(
                    "flex items-center gap-3 p-2.5 rounded-lg text-xs",
                    achieved
                      ? "bg-emerald-50 border border-emerald-200"
                      : isCurrent
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-[--gray-50] border border-[--border-color]",
                  )}
                >
                  <div
                    className={clsx(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      achieved
                        ? "bg-[--success] text-white"
                        : isCurrent
                          ? "bg-[--omf-blue] text-white"
                          : "bg-[--gray-300] text-[--gray-500]",
                    )}
                  >
                    {achieved ? "✓" : m.milestoneNumber}
                  </div>
                  <div className="flex-1">
                    <span className={clsx("font-medium", achieved ? "text-emerald-700" : "text-[--text-primary]")}>
                      Milestone {m.milestoneNumber}
                    </span>
                    <span className="text-[--text-secondary] ml-1">
                      (payment {m.paymentCount})
                    </span>
                  </div>
                  <div className="text-right">
                    {m.rewardType === "apr_decrease" ? (
                      <span className="text-[--success]">APR → {m.apr}%</span>
                    ) : (
                      <span className="text-[--omf-blue]">Limit → ${m.creditLimit.toLocaleString()}</span>
                    )}
                  </div>
                  {idx === 3 && (
                    <span className="text-[--brightway-gold] font-semibold">→ BrightWay+</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Warning */}
      <div
        className="px-4 py-3 text-xs"
        style={{
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "#fffbeb",
          color: "var(--warning)",
        }}
      >
        ⚠️ <strong>Warning:</strong> A late payment resets your Milestone progress. Consistency is everything!
      </div>
    </div>
  );
}
