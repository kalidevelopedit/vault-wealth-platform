import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import onboardingRouter from "./onboarding";
import portfolioRouter from "./portfolio";
import assetsRouter from "./assets";
import transactionsRouter from "./transactions";
import watchlistRouter from "./watchlist";
import marketRouter from "./market";
import usersRouter from "./users";
import adminRouter from "./admin";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/onboarding", onboardingRouter);
router.use("/portfolio", portfolioRouter);
router.use("/assets", assetsRouter);
router.use("/transactions", transactionsRouter);
router.use("/watchlist", watchlistRouter);
router.use("/market", marketRouter);
router.use("/users", usersRouter);
router.use("/admin", adminRouter);
router.use(storageRouter);

export default router;
