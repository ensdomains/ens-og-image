import { addressHandler } from "../routes/api/address";
import { nameHandler } from "../routes/api/name";
import { createBaseRouter } from "./base";

const router = createBaseRouter({
  base: "/api/v1",
});

router.get("/name/:name", nameHandler);
router.get("/address/:address", addressHandler);

export const apiRouter = { ...router };
