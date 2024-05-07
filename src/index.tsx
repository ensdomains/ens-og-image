import { IRequest, Router, cors, error } from "itty-router";
import { apiRouter } from "./routers/api";
import { imageRouter } from "./routers/image";
import { missing } from "./routes/missing";

const { preflight, corsify } = cors({
  allowMethods: ["GET", "OPTIONS"],
  allowHeaders: ["Content-Type"],
  // cache cors preflight for 1 day
  maxAge: 86400,
});

const router = Router<IRequest, [unknown, ctx: ExecutionContext], Response>({
  before: [preflight],
  catch: (err) => {
    console.error(err);
    return error(500, "Internal Server Error");
  },
  finally: [(response) => response ?? missing(), corsify],
});
router.all("/api/v1/*", apiRouter.fetch);
router.all("/image/*", imageRouter.fetch);

export default { ...router };
