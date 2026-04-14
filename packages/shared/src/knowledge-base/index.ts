export { BRIGHTWAY_CARDS } from "./brightway.js";
export { COMPETITOR_CARDS } from "./competitors.js";

import { BRIGHTWAY_CARDS } from "./brightway.js";
import { COMPETITOR_CARDS } from "./competitors.js";
import type { CreditCard } from "../types/products.js";

export const ALL_CARDS: CreditCard[] = [...BRIGHTWAY_CARDS, ...COMPETITOR_CARDS];

export function getCardById(id: string): CreditCard | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}

export function getBrightwayCards(): CreditCard[] {
  return BRIGHTWAY_CARDS;
}

export function getCompetitorCards(): CreditCard[] {
  return COMPETITOR_CARDS;
}
