// packages/shared/src/knowledge-base/index.ts
export { BRIGHTWAY_CARDS } from "./brightway.js";
export { COMPETITOR_CARDS } from "./competitors.js";

import { BRIGHTWAY_CARDS } from "./brightway.js";
import { COMPETITOR_CARDS } from "./competitors.js";

export const ALL_CARDS = [...BRIGHTWAY_CARDS, ...COMPETITOR_CARDS];
