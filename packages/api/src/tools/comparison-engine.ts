import { getCardById, BRIGHTWAY_CARDS, COMPETITOR_CARDS } from "@elt/shared";
import type { CreditCard } from "@elt/shared";
import type { CompareResult, ComparisonDimension } from "@elt/shared";

interface CompareInput {
  brightway_card_id?: string;
  competitor_card_ids?: string[];
  focus_areas?: string[];
}

type Indicator = "win" | "neutral" | "loss";

function indicator(bwWins: boolean | null, bwLoses: boolean | null): Indicator {
  if (bwWins) return "win";
  if (bwLoses) return "loss";
  return "neutral";
}

function formatFee(fee: { min: number; max: number }): string {
  if (fee.min === fee.max) return `$${fee.min}`;
  return `$${fee.min}–$${fee.max}`;
}

export function compareCards(input: CompareInput): CompareResult {
  const bwCardId = input.brightway_card_id ?? "brightway-standard";
  const bwCard = getCardById(bwCardId);

  if (!bwCard) {
    return {
      cards: [],
      dimensions: [],
      verdict: `BrightWay card not found: ${bwCardId}`,
    };
  }

  // Determine which competitors to compare
  let competitors: CreditCard[];
  if (input.competitor_card_ids && input.competitor_card_ids.length > 0) {
    const unknownIds = input.competitor_card_ids.filter((id) => !getCardById(id));
    competitors = input.competitor_card_ids
      .map((id) => getCardById(id))
      .filter((c): c is CreditCard => c !== undefined);
    if (unknownIds.length > 0 && competitors.length > 0) {
      // Will include warning in verdict
      (competitors as CreditCard[] & { _unknownIds?: string[] })._unknownIds = unknownIds;
    }
    if (unknownIds.length > 0 && competitors.length === 0) {
      return {
        cards: [{ id: bwCard.id, name: bwCard.name, issuer: bwCard.issuer }],
        dimensions: [],
        verdict: `No valid competitor cards found. Unknown IDs: ${unknownIds.join(", ")}. Available IDs can be retrieved via get_product_info.`,
      };
    }
  } else {
    // Default: compare to Capital One (best APR), Aspire (best rewards), OpenSky (secured baseline)
    competitors = [
      getCardById("capital-one-platinum-secured"),
      getCardById("indigo-platinum"),
      getCardById("credit-one-platinum-visa"),
    ].filter((c): c is CreditCard => c !== undefined);
  }

  if (competitors.length === 0) {
    return {
      cards: [{ id: bwCard.id, name: bwCard.name, issuer: bwCard.issuer }],
      dimensions: [],
      verdict: "No valid competitor cards found to compare.",
    };
  }

  const allCards = [bwCard, ...competitors];
  const focusAreas = input.focus_areas ?? ["all"];
  const showAll = focusAreas.includes("all");

  const dimensions: ComparisonDimension[] = [];

  // APR
  if (showAll || focusAreas.includes("apr")) {
    dimensions.push({
      name: "Regular APR",
      cards: allCards.map((card) => {
        const isBW = card.id === bwCard.id;
        const bwApr = bwCard.apr.regular;
        const cardApr = card.apr.regular;
        const aprType = card.apr.type === "variable" ? " (var)" : " (fixed)";
        let ind: Indicator;
        if (isBW) {
          const anyCompetitorLower = competitors.some((c) => c.apr.regular < bwApr);
          ind = anyCompetitorLower ? "loss" : "win";
        } else {
          ind = cardApr < bwApr ? "win" : cardApr === bwApr ? "neutral" : "loss";
        }
        return { cardId: card.id, value: `${cardApr}%${aprType}`, indicator: ind };
      }),
    });

    // APR floor (BrightWay unique)
    if (bwCard.apr.floor) {
      dimensions.push({
        name: "APR Floor (Milestone)",
        cards: allCards.map((card) => ({
          cardId: card.id,
          value: card.apr.floor ? `${card.apr.floor}% (via Milestones)` : "N/A",
          indicator: card.apr.floor ? ("win" as Indicator) : ("loss" as Indicator),
        })),
      });
    }
  }

  // Fees
  if (showAll || focusAreas.includes("fees")) {
    dimensions.push({
      name: "Annual Fee",
      cards: allCards.map((card) => {
        const isBW = card.id === bwCard.id;
        const bwFee = bwCard.annualFee.max;
        const cardFee = card.annualFee.max;
        let ind: Indicator;
        if (isBW) {
          const anyCompetitorLower = competitors.some((c) => c.annualFee.max < bwFee);
          ind = anyCompetitorLower ? "loss" : "win";
        } else {
          ind = cardFee < bwFee ? "win" : cardFee === bwFee ? "neutral" : "loss";
        }
        return { cardId: card.id, value: formatFee(card.annualFee), indicator: ind };
      }),
    });

    dimensions.push({
      name: "Foreign Transaction Fee",
      cards: allCards.map((card) => {
        const bwFtf = bwCard.fees.foreignTransaction;
        const cardFtf = card.fees.foreignTransaction;
        const isBW = card.id === bwCard.id;
        let ind: Indicator;
        if (isBW) {
          const anyLower = competitors.some((c) => c.fees.foreignTransaction < bwFtf);
          ind = anyLower ? "neutral" : "win";
        } else {
          ind = cardFtf === 0 ? "win" : cardFtf <= bwFtf ? "neutral" : "loss";
        }
        return { cardId: card.id, value: `${cardFtf}%`, indicator: ind };
      }),
    });
  }

  // Rewards
  if (showAll || focusAreas.includes("rewards")) {
    dimensions.push({
      name: "Cash Back",
      cards: allCards.map((card) => {
        const isBW = card.id === bwCard.id;
        const bwRate = bwCard.cashBack.baseRate;
        const cardRate = card.cashBack.baseRate;
        let ind: Indicator;
        if (isBW) {
          const anyHigher = competitors.some((c) => c.cashBack.baseRate > bwRate);
          ind = anyHigher ? "neutral" : "win";
        } else {
          ind = !card.cashBack.enabled
            ? "loss"
            : cardRate > bwRate
              ? "win"
              : cardRate === bwRate
                ? "neutral"
                : "loss";
        }
        const value = card.cashBack.enabled
          ? `${card.cashBack.baseRate}% ${card.cashBack.note ? `(${card.cashBack.note.split(" — ")[0]})` : ""}`
          : "None";
        return { cardId: card.id, value, indicator: ind };
      }),
    });
  }

  // Credit Limit
  if (showAll || focusAreas.includes("credit_limit")) {
    dimensions.push({
      name: "Max Credit Limit (Long-term)",
      cards: allCards.map((card) => {
        const bwMax = bwCard.creditLimit.eventualMax;
        const cardMax = card.creditLimit.eventualMax;
        const isBW = card.id === bwCard.id;
        let ind: Indicator;
        if (isBW) {
          const anyHigher = competitors.some((c) => c.creditLimit.eventualMax > bwMax);
          ind = anyHigher ? "neutral" : "win";
        } else {
          ind = cardMax > bwMax ? "win" : cardMax === bwMax ? "neutral" : "loss";
        }
        return { cardId: card.id, value: `$${cardMax.toLocaleString()}`, indicator: ind };
      }),
    });
  }

  // Graduation / Upgrade Path
  if (showAll || focusAreas.includes("graduation")) {
    dimensions.push({
      name: "Clear Graduation Path",
      cards: allCards.map((card) => ({
        cardId: card.id,
        value: card.milestones
          ? `Yes — ${card.milestones.graduationMilestones} Milestones → ${card.milestones.graduationCard}`
          : "No",
        indicator: card.milestones ? ("win" as Indicator) : ("loss" as Indicator),
      })),
    });
  }

  // Security Deposit
  if (showAll) {
    dimensions.push({
      name: "No Security Deposit",
      cards: allCards.map((card) => ({
        cardId: card.id,
        value: card.depositRequired ? `Required ($${card.depositRange?.min}+)` : "Not required",
        indicator: (!card.depositRequired ? "win" : "loss") as Indicator,
      })),
    });
  }

  // Build verdict
  const verdict = buildVerdict(bwCard, competitors, dimensions);

  return {
    cards: allCards.map((c) => ({ id: c.id, name: c.name, issuer: c.issuer })),
    dimensions,
    verdict,
  };
}

function buildVerdict(
  bwCard: CreditCard,
  competitors: CreditCard[],
  dimensions: ComparisonDimension[]
): string {
  const bwWins = dimensions.filter((d) => {
    const bwEntry = d.cards.find((c) => c.cardId === bwCard.id);
    return bwEntry?.indicator === "win";
  }).length;

  const bwLosses = dimensions.filter((d) => {
    const bwEntry = d.cards.find((c) => c.cardId === bwCard.id);
    return bwEntry?.indicator === "loss";
  }).length;

  const competitorNames = competitors.map((c) => c.name).join(", ");

  const parts: string[] = [
    `BrightWay wins on ${bwWins} dimension${bwWins !== 1 ? "s" : ""} and loses on ${bwLosses} vs ${competitorNames}.`,
  ];

  const hasCashBackAdvantage = dimensions.some(
    (d) =>
      d.name === "Cash Back" &&
      d.cards.find((c) => c.cardId === bwCard.id)?.indicator === "win"
  );

  const hasAprDisadvantage = dimensions.some(
    (d) =>
      d.name === "Regular APR" &&
      d.cards.find((c) => c.cardId === bwCard.id)?.indicator === "loss"
  );

  const hasGraduationAdvantage = dimensions.some(
    (d) =>
      d.name === "Clear Graduation Path" &&
      d.cards.find((c) => c.cardId === bwCard.id)?.indicator === "win"
  );

  if (hasCashBackAdvantage) {
    parts.push("BrightWay is rare in the sub-prime space for offering unlimited cash back.");
  }

  if (hasAprDisadvantage) {
    parts.push(
      "The 35.99% APR is a real drawback — if you might carry a balance, a lower-APR option could save you money."
    );
  }

  if (hasGraduationAdvantage) {
    parts.push(
      "BrightWay's Milestone graduation path to BrightWay+ ($0 annual fee) is a unique long-term advantage."
    );
  }

  parts.push("Always verify current rates at onemainfinancial.com.");

  return parts.join(" ");
}
