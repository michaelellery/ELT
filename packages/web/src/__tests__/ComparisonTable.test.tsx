// packages/web/src/__tests__/ComparisonTable.test.tsx
// Tests for ComparisonTable widget — ELT-12

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// TODO (Dev 1): Import actual component when ELT-15 is complete
// import ComparisonTable from "../components/widgets/ComparisonTable";

interface MockDimension {
  name: string;
  brightwayValue: string;
  competitorValue: string;
  indicator: "win" | "neutral" | "loss";
}

interface MockComparisonTableProps {
  brightwayCardName?: string;
  competitorCardName?: string;
  dimensions?: MockDimension[];
  verdict?: string;
}

const DEFAULT_DIMENSIONS: MockDimension[] = [
  { name: "APR", brightwayValue: "35.99%", competitorValue: "29.99%", indicator: "loss" },
  { name: "Annual Fee", brightwayValue: "$0-$89", competitorValue: "$0", indicator: "neutral" },
  { name: "Cash Back", brightwayValue: "1%", competitorValue: "0%", indicator: "win" },
  { name: "Unsecured", brightwayValue: "✅ Yes", competitorValue: "❌ No", indicator: "win" },
  { name: "Bureau Reporting", brightwayValue: "All 3", competitorValue: "All 3", indicator: "neutral" },
  { name: "Milestone Program", brightwayValue: "✅ Yes", competitorValue: "❌ No", indicator: "win" },
  { name: "Max Credit Limit", brightwayValue: "$15,000", competitorValue: "$3,000", indicator: "win" },
  { name: "Foreign Txn Fee", brightwayValue: "1%", competitorValue: "0%", indicator: "loss" },
];

const MockComparisonTable = ({
  brightwayCardName = "BrightWay",
  competitorCardName = "Capital One Secured",
  dimensions = DEFAULT_DIMENSIONS,
  verdict = "BrightWay wins on cash back, limit ceiling, and no deposit required.",
}: MockComparisonTableProps) => (
  <div data-testid="comparison-table">
    <div data-testid="table-header">
      <span data-testid="brightway-column-header">{brightwayCardName}</span>
      <span data-testid="competitor-column-header">{competitorCardName}</span>
    </div>
    <div data-testid="table-body">
      {dimensions.map((dim) => (
        <div key={dim.name} data-testid={`dimension-row-${dim.name.replace(/\s/g, "-").toLowerCase()}`}>
          <span data-testid="dimension-name">{dim.name}</span>
          <span data-testid="brightway-value" data-indicator={dim.indicator}>
            {dim.brightwayValue}
          </span>
          <span data-testid="competitor-value">{dim.competitorValue}</span>
          <span data-testid="win-indicator">
            {dim.indicator === "win" ? "✅" : dim.indicator === "loss" ? "❌" : "—"}
          </span>
        </div>
      ))}
    </div>
    <div data-testid="verdict">{verdict}</div>
  </div>
);

describe("ComparisonTable", () => {
  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<MockComparisonTable />);
      expect(screen.getByTestId("comparison-table")).toBeTruthy();
    });

    it("shows BrightWay column header", () => {
      render(<MockComparisonTable />);
      expect(screen.getByTestId("brightway-column-header")).toBeTruthy();
      expect(screen.getByText("BrightWay")).toBeTruthy();
    });

    it("shows competitor column header", () => {
      render(<MockComparisonTable />);
      expect(screen.getByTestId("competitor-column-header")).toBeTruthy();
      expect(screen.getByText("Capital One Secured")).toBeTruthy();
    });

    it("renders all 8 comparison dimensions", () => {
      render(<MockComparisonTable />);
      expect(screen.getAllByTestId("dimension-name")).toHaveLength(8);
    });

    it("shows verdict text", () => {
      render(<MockComparisonTable />);
      expect(screen.getByTestId("verdict")).toBeTruthy();
      expect(screen.getByText(/BrightWay wins/)).toBeTruthy();
    });
  });

  describe("Dimension rows", () => {
    it("renders APR row", () => {
      render(<MockComparisonTable />);
      expect(screen.getByTestId("dimension-row-apr")).toBeTruthy();
    });

    it("renders Annual Fee row", () => {
      render(<MockComparisonTable />);
      expect(screen.getByTestId("dimension-row-annual-fee")).toBeTruthy();
    });

    it("renders Cash Back row", () => {
      render(<MockComparisonTable />);
      expect(screen.getByTestId("dimension-row-cash-back")).toBeTruthy();
    });

    it("renders Milestone Program row", () => {
      render(<MockComparisonTable />);
      expect(screen.getByTestId("dimension-row-milestone-program")).toBeTruthy();
    });

    it("renders Max Credit Limit row", () => {
      render(<MockComparisonTable />);
      expect(screen.getByTestId("dimension-row-max-credit-limit")).toBeTruthy();
    });
  });

  describe("Win/Loss indicators", () => {
    it("shows ✅ for BrightWay wins", () => {
      render(<MockComparisonTable />);
      // Cash Back, Unsecured, Milestone, and Max Limit are wins
      const winIndicators = screen.getAllByText("✅");
      expect(winIndicators.length).toBeGreaterThanOrEqual(4);
    });

    it("shows ❌ for BrightWay losses", () => {
      render(<MockComparisonTable />);
      // APR and Foreign Txn are losses
      const lossIndicators = screen.getAllByText("❌");
      expect(lossIndicators.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Custom data", () => {
    it("renders with custom card names", () => {
      render(
        <MockComparisonTable
          brightwayCardName="BrightWay+"
          competitorCardName="Surge Platinum"
        />
      );
      expect(screen.getByText("BrightWay+")).toBeTruthy();
      expect(screen.getByText("Surge Platinum")).toBeTruthy();
    });

    it("renders with custom dimensions", () => {
      const customDims = [
        { name: "APR", brightwayValue: "35.99%", competitorValue: "35.9%", indicator: "loss" as const },
      ];
      render(<MockComparisonTable dimensions={customDims} />);
      expect(screen.getAllByTestId("dimension-name")).toHaveLength(1);
    });
  });

  // TODO (Dev 1): Integration tests once real component exists
  it.todo("BrightWay column is visually highlighted/pinned");
  it.todo("table scrolls horizontally on mobile");
  it.todo("handles empty verdict gracefully");
});
