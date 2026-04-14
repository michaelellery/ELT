import { Hono } from "hono";
import { ALL_CARDS, getCardById } from "@elt/shared";

const productsRouter = new Hono();

productsRouter.get("/products", (c) => {
  return c.json(ALL_CARDS);
});

productsRouter.get("/products/:id", (c) => {
  const id = c.req.param("id");
  const card = getCardById(id);

  if (!card) {
    return c.json({ error: "Card not found", id }, 404);
  }

  return c.json(card);
});

export default productsRouter;
