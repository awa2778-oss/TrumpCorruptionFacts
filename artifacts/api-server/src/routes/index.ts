import { Router, type IRouter } from "express";
import healthRouter from "./health";
import actionsRouter from "./actions";
import supremeCourtRouter from "./supreme-court";
import administrationsRouter from "./administrations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(actionsRouter);
router.use(supremeCourtRouter);
router.use(administrationsRouter);

export default router;
