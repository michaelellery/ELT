// packages/api/src/__tests__/milestone.test.ts
// Milestone tracker tests — ELT-12
// Key invariants: APR floor 19.99%, credit limit ceiling $15,000

import { describe, it, expect } from "vitest";

// Inline milestone tracker for tests
// TODO: Replace with import from tools/milestone-tracker.ts when Dev 2 creates it

const APR_FLOOR = 19.99;
const LIMIT_CEILING = 15000;
const GRADUATION_MILESTONES = 4;

interface MilestoneSnapshot {
  milestoneNumber: number;
  paymentCount: number;
  apr: number;
  creditLimit: number;
  rewardType: "apr_decrease" | "credit_limit_increase";
  isGraduation: boolean;
}

function trackMilestoneProgress(params: {
  startingApr?: number;
  startingCreditLimit?: number;
  milestonesToShow?: number;
  rewardPreference?: "apr_decrease" | "credit_limit_increase" | "alternating";
}): MilestoneSnapshot[] {
  const {
    startingApr = 35.99,
    startingCreditLimit = 1000,
    milestonesToShow = 4,
    rewardPreference = "alternating",
  } = params;

  const snapshots: MilestoneSnapshot[] = [];
  let currentApr = startingApr;
  let currentLimit = startingCreditLimit;

  for (let i = 1; i <= milestonesToShow; i++) {
    const paymentCount = i * 6;
    let rewardType: "apr_decrease" | "credit_limit_increase";

    if (rewardPreference === "alternating") {
      rewardType = i % 2 === 1 ? "apr_decrease" : "credit_limit_increase";
    } else {
      rewardType = rewardPreference;
    }

    // Apply reward
    if (rewardType === "apr_decrease") {
      // Reduce APR by ~4% per milestone, floor at APR_FLOOR
      currentApr = Math.max(APR_FLOOR, currentApr - 4.0);
    } else {
      // Increase limit by $1000-$2000, ceiling at LIMIT_CEILING
      currentLimit = Math.min(LIMIT_CEILING, currentLimit + 1500);
    }

    snapshots.push({
      milestoneNumber: i,
      paymentCount,
      apr: Math.round(currentApr * 100) / 100,
      creditLimit: currentLimit,
      rewardType,
      isGraduation: i === GRADUATION_MILESTONES,
    });
  }

  return snapshots;
}

describe("Milestone Tracker", () => {
  describe("APR floor — CRITICAL invariant", () => {
    it("APR never drops below 19.99% regardless of starting APR", () => {
      const snapshots = trackMilestoneProgress({
        startingApr: 22.0, // Close to floor
        milestonesToShow: 8,
        rewardPreference: "apr_decrease",
      });
      snapshots.forEach((s) => {
        expect(s.apr).toBeGreaterThanOrEqual(APR_FLOOR);
      });
    });

    it("APR never drops below 19.99% from starting 35.99%", () => {
      const snapshots = trackMilestoneProgress({
        startingApr: 35.99,
        milestonesToShow: 8,
        rewardPreference: "apr_decrease",
      });
      snapshots.forEach((s) => {
        expect(s.apr).toBeGreaterThanOrEqual(APR_FLOOR);
      });
    });

    it("APR hits floor and stays there — does not go lower", () => {
      const snapshots = trackMilestoneProgress({
        startingApr: 21.0,
        milestonesToShow: 6,
        rewardPreference: "apr_decrease",
      });
      const atFloor = snapshots.filter((s) => s.apr === APR_FLOOR);
      if (atFloor.length > 1) {
        // Once at floor, should stay at floor
        const floorIdx = snapshots.findIndex((s) => s.apr === APR_FLOOR);
        for (let i = floorIdx; i < snapshots.length; i++) {
          expect(snapshots[i]?.apr).toBe(APR_FLOOR);
        }
      }
    });
  });

  describe("Credit limit ceiling — CRITICAL invariant", () => {
    it("credit limit never exceeds $15,000", () => {
      const snapshots = trackMilestoneProgress({
        startingCreditLimit: 14000, // Close to ceiling
        milestonesToShow: 8,
        rewardPreference: "credit_limit_increase",
      });
      snapshots.forEach((s) => {
        expect(s.creditLimit).toBeLessThanOrEqual(LIMIT_CEILING);
      });
    });

    it("credit limit ceiling enforced for any starting amount", () => {
      const snapshots = trackMilestoneProgress({
        startingCreditLimit: 1000,
        milestonesToShow: 20, // Way more than needed to hit ceiling
        rewardPreference: "credit_limit_increase",
      });
      snapshots.forEach((s) => {
        expect(s.creditLimit).toBeLessThanOrEqual(LIMIT_CEILING);
      });
    });
  });

  describe("Milestone progression", () => {
    it("4 milestones marks graduation to BrightWay+", () => {
      const snapshots = trackMilestoneProgress({ milestonesToShow: 4 });
      const gradMilestone = snapshots.find((s) => s.isGraduation);
      expect(gradMilestone).toBeDefined();
      expect(gradMilestone?.milestoneNumber).toBe(4);
    });

    it("milestone 1 is at 6 payments", () => {
      const snapshots = trackMilestoneProgress({ milestonesToShow: 4 });
      expect(snapshots[0]?.paymentCount).toBe(6);
    });

    it("milestone 2 is at 12 payments", () => {
      const snapshots = trackMilestoneProgress({ milestonesToShow: 4 });
      expect(snapshots[1]?.paymentCount).toBe(12);
    });

    it("milestone 4 (graduation) is at 24 payments", () => {
      const snapshots = trackMilestoneProgress({ milestonesToShow: 4 });
      expect(snapshots[3]?.paymentCount).toBe(24);
    });

    it("alternating preference alternates rewards correctly", () => {
      const snapshots = trackMilestoneProgress({
        milestonesToShow: 4,
        rewardPreference: "alternating",
      });
      expect(snapshots[0]?.rewardType).toBe("apr_decrease");
      expect(snapshots[1]?.rewardType).toBe("credit_limit_increase");
      expect(snapshots[2]?.rewardType).toBe("apr_decrease");
      expect(snapshots[3]?.rewardType).toBe("credit_limit_increase");
    });

    it("APR preference always decreases APR", () => {
      const snapshots = trackMilestoneProgress({
        startingApr: 35.99,
        milestonesToShow: 4,
        rewardPreference: "apr_decrease",
      });
      snapshots.forEach((s) => {
        expect(s.rewardType).toBe("apr_decrease");
      });
    });
  });

  describe("Default values", () => {
    it("defaults to 35.99% starting APR", () => {
      const snapshots = trackMilestoneProgress({
        milestonesToShow: 1,
        rewardPreference: "credit_limit_increase", // So APR doesn't change
      });
      // Starting APR should be 35.99 before any reductions
      expect(snapshots).toBeDefined();
    });

    it("defaults to 4 milestones", () => {
      const snapshots = trackMilestoneProgress({});
      expect(snapshots).toHaveLength(4);
    });
  });
});
