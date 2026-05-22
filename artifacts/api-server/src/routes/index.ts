import { Router, type IRouter } from "express";
import healthRouter from "./health";
import actionsRouter from "./actions";
import supremeCourtRouter from "./supreme-court";
import administrationsRouter from "./administrations";
import overreachRouter from "./overreach";

const router: IRouter = Router();

router.use(healthRouter);
router.use(actionsRouter);
router.use(supremeCourtRouter);
router.use(administrationsRouter);
router.use(overreachRouter);

export default router;
