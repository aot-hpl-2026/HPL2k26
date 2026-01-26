import { Router } from "express";
import authRoutes from "./authRoutes.js";
import teamRoutes from "./teamRoutes.js";
import playerRoutes from "./playerRoutes.js";
import matchRoutes from "./matchRoutes.js";
import pointsRoutes from "./pointsRoutes.js";
import statsRoutes from "./statsRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/teams", teamRoutes);
router.use("/players", playerRoutes);
router.use("/matches", matchRoutes);
router.use("/points-table", pointsRoutes);
router.use("/stats", statsRoutes);

export default router;
