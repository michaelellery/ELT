import { ExternalLink, Phone } from "lucide-react";
import { Badge } from "../ui/Badge.js";

const BRIGHTWAY_DATA = {
  name: "BrightWay Mastercard",
  issuer: "OneMain Financial",
  network: "Mastercard",
  apr: "35.99% fixed",
  cashBack: "1% on all purchases",
  annualFee: "$0 – $89",
  creditLimit: "Up to $1,500 to start / $15,000 over time",
  foreignTxn: "1% (vs 3% industry avg)",
  bureauReporting: "All 3 bureaus",
  features: [
    "No security deposit required",
    "Reports to all 3 credit bureaus",
    "Milestone reward system",
    "Mastercard global acceptance",
    "Upgrade path to BrightWay+",
  ],
  website: "https://onemainfinancial.com/credit-cards/brightway",
  phone: "1-800-961-5577",
  dataAsOf: "April 2026",
};

interface CardSummaryCardProps {
  cardId?: string;
}

export function CardSummaryCard({ cardId: _cardId }: CardSummaryCardProps) {
  return (
    <div
      className="rounded-xl overflow-hidden shadow-sm max-w-md w-full"
      style={{
        border: "1px solid var(--border-color)",
        borderLeft: "4px solid var(--omf-blue)",
      }}
    >
      {/* Card header */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: "var(--omf-navy)" }}
      >
        <span className="text-2xl" aria-hidden="true">💳</span>
        <div>
          <p className="text-white font-semibold text-sm">{BRIGHTWAY_DATA.name}</p>
          <p className="text-white/60 text-xs">{BRIGHTWAY_DATA.issuer} · {BRIGHTWAY_DATA.network}</p>
        </div>
        <Badge variant="gold" className="ml-auto">
          Invite Only
        </Badge>
      </div>

      {/* Key stats */}
      <div
        className="p-4 grid grid-cols-2 gap-x-4 gap-y-3"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        {[
          { label: "Regular APR", value: BRIGHTWAY_DATA.apr },
          { label: "Cash Back", value: BRIGHTWAY_DATA.cashBack },
          { label: "Annual Fee", value: BRIGHTWAY_DATA.annualFee },
          { label: "Credit Limit", value: BRIGHTWAY_DATA.creditLimit },
          { label: "Foreign Txn", value: BRIGHTWAY_DATA.foreignTxn },
          { label: "Bureau Report", value: BRIGHTWAY_DATA.bureauReporting },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-[--text-secondary] mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-[--text-primary]">{value}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div
        className="px-4 pb-3"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <p className="text-xs font-medium text-[--text-secondary] pt-3 pb-2">Key Features</p>
        <ul className="flex flex-col gap-1">
          {BRIGHTWAY_DATA.features.map((f) => (
            <li key={f} className="text-xs text-[--text-primary] flex items-start gap-1.5">
              <span className="text-[--success] mt-0.5" aria-hidden="true">✅</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{
          backgroundColor: "var(--gray-50)",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <a
          href={BRIGHTWAY_DATA.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[--omf-blue] hover:underline"
        >
          <ExternalLink size={12} aria-hidden="true" />
          Learn More
        </a>
        <a
          href={`tel:${BRIGHTWAY_DATA.phone}`}
          className="flex items-center gap-1 text-xs text-[--omf-blue] hover:underline"
        >
          <Phone size={12} aria-hidden="true" />
          {BRIGHTWAY_DATA.phone}
        </a>
        <span className="text-xs text-[--text-secondary] ml-auto">
          Data as of {BRIGHTWAY_DATA.dataAsOf}
        </span>
      </div>
    </div>
  );
}
