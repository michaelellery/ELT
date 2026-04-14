// packages/api/src/__tests__/pii-filter.test.ts
// PII detection tests — ELT-12
// Must detect SSNs and credit card numbers, pass normal messages through

import { describe, it, expect } from "vitest";

// Inline PII filter logic for tests
// TODO: Replace with import from middleware/pii-filter.ts when Dev 2 creates it

const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/;
const CREDIT_CARD_PATTERN = /\b(?:\d{4}[\s-]?){3}\d{4}\b/;

function containsPII(text: string): { detected: boolean; type?: "ssn" | "credit_card" } {
  if (SSN_PATTERN.test(text)) {
    return { detected: true, type: "ssn" };
  }
  if (CREDIT_CARD_PATTERN.test(text)) {
    return { detected: true, type: "credit_card" };
  }
  return { detected: false };
}

const SAFE_RESPONSE =
  "Please don't share sensitive information like Social Security Numbers or credit card numbers in this chat. How else can I help you with BrightWay?";

describe("PII Filter", () => {
  describe("SSN detection", () => {
    it("detects standard SSN format: 123-45-6789", () => {
      const result = containsPII("My SSN is 123-45-6789");
      expect(result.detected).toBe(true);
      expect(result.type).toBe("ssn");
    });

    it("detects SSN in longer sentence", () => {
      const result = containsPII("I need help with my account, SSN 987-65-4321 for verification");
      expect(result.detected).toBe(true);
      expect(result.type).toBe("ssn");
    });

    it("detects SSN at start of message", () => {
      const result = containsPII("000-12-3456 is my social security number");
      expect(result.detected).toBe(true);
      expect(result.type).toBe("ssn");
    });

    it("does NOT flag phone numbers (different format)", () => {
      const result = containsPII("Call me at 555-867-5309");
      expect(result.detected).toBe(false);
    });

    it("does NOT flag dates with dashes", () => {
      const result = containsPII("My birthday is 12-25-1990");
      // Note: this might match depending on pattern — document the behavior
      // The SSN pattern is \d{3}-\d{2}-\d{4} which wouldn't match 12-25-1990 (only 2 digits first)
      expect(result.detected).toBe(false);
    });
  });

  describe("Credit card number detection", () => {
    it("detects Visa test number: 4111111111111111", () => {
      const result = containsPII("my card number is 4111111111111111");
      expect(result.detected).toBe(true);
      expect(result.type).toBe("credit_card");
    });

    it("detects formatted CC number: 4111-1111-1111-1111", () => {
      const result = containsPII("Card: 4111-1111-1111-1111");
      expect(result.detected).toBe(true);
      expect(result.type).toBe("credit_card");
    });

    it("detects space-separated CC number: 4111 1111 1111 1111", () => {
      const result = containsPII("Number: 4111 1111 1111 1111");
      expect(result.detected).toBe(true);
      expect(result.type).toBe("credit_card");
    });

    it("detects Mastercard test number: 5500000000000004", () => {
      const result = containsPII("5500000000000004");
      expect(result.detected).toBe(true);
      expect(result.type).toBe("credit_card");
    });
  });

  describe("Normal messages pass through", () => {
    it("regular question passes through", () => {
      const result = containsPII("What is the APR for BrightWay?");
      expect(result.detected).toBe(false);
    });

    it("spending amounts pass through", () => {
      const result = containsPII("I spend about $500 per month on groceries");
      expect(result.detected).toBe(false);
    });

    it("credit score mention passes through", () => {
      const result = containsPII("My credit score is 620");
      expect(result.detected).toBe(false);
    });

    it("annual fee question passes through", () => {
      const result = containsPII("Does BrightWay have an annual fee?");
      expect(result.detected).toBe(false);
    });

    it("empty message passes through", () => {
      const result = containsPII("");
      expect(result.detected).toBe(false);
    });

    it("milestone question passes through", () => {
      const result = containsPII("How does the milestone reward system work?");
      expect(result.detected).toBe(false);
    });
  });

  describe("PII filter safe response", () => {
    it("safe response is defined and non-empty", () => {
      expect(SAFE_RESPONSE).toBeTruthy();
      expect(SAFE_RESPONSE.length).toBeGreaterThan(20);
    });

    it("safe response does not contain PII itself", () => {
      const check = containsPII(SAFE_RESPONSE);
      expect(check.detected).toBe(false);
    });
  });
});
