import { addressHandler } from "../routes/image/address";
import { nameHandler } from "../routes/image/name";
import { createBaseRouter } from "./base";

const router = createBaseRouter({ base: "/image" });
router.get("/name/:name", nameHandler);
router.get("/address/:address", addressHandler);

export const imageRouter = { ...router };
