import { getCardById } from "@elt/shared";
import type { CreditCard } from "@elt/shared";

interface ProductInfoInput {
  card_id: string;
  fields?: string[];
}

export function handleGetProductInfo(input: ProductInfoInput): unknown {
  const card = getCardById(input.card_id);

  if (!card) {
    return {
      error: `Card not found: ${input.card_id}`,
      available_ids: [
        "brightway-standard",
        "brightway-cashback",
        "brightway-plus",
        "capital-one-platinum-secured",
        "indigo-platinum",
        "destiny-mastercard",
        "credit-one-platinum-visa",
        "surge-platinum-mastercard",
        "aspire-cashback-rewards",
        "revvi-visa",
        "opensky-secured-visa",
      ],
    };
  }

  const fields = input.fields ?? ["all"];

  if (fields.includes("all")) {
    return card;
  }

  const result: Partial<CreditCard> & { id: string; name: string } = {
    id: card.id,
    name: card.name,
  };

  for (const field of fields) {
    switch (field) {
      case "apr":
        result.apr = card.apr;
        break;
      case "fees":
        result.fees = card.fees;
        result.annualFee = card.annualFee;
        break;
      case "cashback":
        result.cashBack = card.cashBack;
        break;
      case "credit_limit":
        result.creditLimit = card.creditLimit;
        break;
      case "milestones":
        result.milestones = card.milestones;
        break;
      case "features":
        result.features = card.features;
        break;
    }
  }

  return result;
}
