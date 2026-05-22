import { Router, type IRouter } from "express";
import healthRouter from "./health";
import actionsRouter from "./actions";
import supremeCourtRouter from "./supreme-court";
import administrationsRouter from "./administrations";
import overreachRouter from "./overreach";
import executiveOrdersRouter from "./executive-orders";
import retributionRouter from "./retribution";

const router: IRouter = Router();

router.use(healthRouter);
router.use(actionsRouter);
router.use(supremeCourtRouter);
router.use(administrationsRouter);
router.use(overreachRouter);
router.use(executiveOrdersRouter);
router.use(retributionRouter);

export default router;
