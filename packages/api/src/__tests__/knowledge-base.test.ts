import { describe, it, expect } from "vitest";
import {
  BRIGHTWAY_CARDS,
  COMPETITOR_CARDS,
  ALL_CARDS,
  getCardById,
} from "@elt/shared";

describe("BrightWay Knowledge Base", () => {
  it("has exactly 3 BrightWay card variants", () => {
    expect(BRIGHTWAY_CARDS).toHaveLength(3);
  });

  it("has all 3 expected BrightWay card IDs", () => {
    const ids = BRIGHTWAY_CARDS.map((c) => c.id);
    expect(ids).toContain("brightway-standard");
    expect(ids).toContain("brightway-cashback");
    expect(ids).toContain("brightway-plus");
  });

  it("BrightWay Standard has correct APR", () => {
    const card = getCardById("brightway-standard");
    expect(card).toBeDefined();
    expect(card!.apr.regular).toBe(35.99);
    expect(card!.apr.floor).toBe(19.99);
    expect(card!.apr.type).toBe("fixed");
  });

  it("BrightWay Standard has 1% cash back", () => {
    const card = getCardById("brightway-standard");
    expect(card!.cashBack.enabled).toBe(true);
    expect(card!.cashBack.baseRate).toBe(1.0);
  });

  it("BrightWay Standard reports to all 3 bureaus", () => {
    const card = getCardById("brightway-standard");
    expect(card!.bureauReporting).toContain("Equifax");
    expect(card!.bureauReporting).toContain("Experian");
    expect(card!.bureauReporting).toContain("TransUnion");
  });

  it("BrightWay Standard has correct credit limits", () => {
    const card = getCardById("brightway-standard");
    expect(card!.creditLimit.startingMin).toBe(300);
    expect(card!.creditLimit.startingMax).toBe(1500);
    expect(card!.creditLimit.eventualMax).toBe(15000);
  });

  it("BrightWay Standard is unsecured (no deposit required)", () => {
    const card = getCardById("brightway-standard");
    expect(card!.secured).toBe(false);
    expect(card!.depositRequired).toBe(false);
  });

  it("BrightWay Standard has Milestone config", () => {
    const card = getCardById("brightway-standard");
    expect(card!.milestones).toBeDefined();
    expect(card!.milestones!.paymentsPerMilestone).toBe(6);
    expect(card!.milestones!.graduationMilestones).toBe(4);
    expect(card!.milestones!.graduationCard).toBe("BrightWay+");
    expect(card!.milestones!.forfeitOnLatePayment).toBe(true);
  });

  it("BrightWay 1.5% Cashback has 1.5% rate", () => {
    const card = getCardById("brightway-cashback");
    expect(card!.cashBack.baseRate).toBe(1.5);
    expect(card!.creditLimit.startingMax).toBe(3000);
  });

  it("BrightWay+ has $0 annual fee", () => {
    const card = getCardById("brightway-plus");
    expect(card!.annualFee.min).toBe(0);
    expect(card!.annualFee.max).toBe(0);
  });

  it("all BrightWay cards have low 1% foreign transaction fee", () => {
    for (const card of BRIGHTWAY_CARDS) {
      expect(card.fees.foreignTransaction).toBe(1.0);
    }
  });

  it("all BrightWay cards have required fields", () => {
    for (const card of BRIGHTWAY_CARDS) {
      expect(card.id).toBeDefined();
      expect(card.name).toBeDefined();
      expect(card.issuer).toBe("OneMain Financial");
      expect(card.network).toBe("Mastercard");
      expect(card.dataAsOf).toBe("2026-04");
    }
  });
});

describe("Competitor Knowledge Base", () => {
  it("has exactly 8 competitor cards", () => {
    expect(COMPETITOR_CARDS).toHaveLength(8);
  });

  it("Capital One Platinum Secured has correct data", () => {
    const card = getCardById("capital-one-platinum-secured");
    expect(card).toBeDefined();
    expect(card!.apr.regular).toBe(28.99);
    expect(card!.annualFee.max).toBe(0);
    expect(card!.cashBack.enabled).toBe(false);
    expect(card!.depositRequired).toBe(true);
  });

  it("OpenSky has lowest APR at 22.64%", () => {
    const card = getCardById("opensky-secured-visa");
    expect(card!.apr.regular).toBe(22.64);
    expect(card!.depositRequired).toBe(true);
  });

  it("all competitor cards have required fields", () => {
    for (const card of COMPETITOR_CARDS) {
      expect(card.id).toBeDefined();
      expect(card.name).toBeDefined();
      expect(card.apr.regular).toBeGreaterThan(0);
      expect(card.dataAsOf).toBe("2026-04");
    }
  });

  it("returns undefined for unknown card ID", () => {
    const card = getCardById("nonexistent-card-xyz");
    expect(card).toBeUndefined();
  });
});

describe("ALL_CARDS", () => {
  it("contains all BrightWay + competitor cards", () => {
    expect(ALL_CARDS).toHaveLength(BRIGHTWAY_CARDS.length + COMPETITOR_CARDS.length);
    expect(ALL_CARDS).toHaveLength(11);
  });
});
