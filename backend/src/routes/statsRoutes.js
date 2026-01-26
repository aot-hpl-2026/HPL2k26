import { Router } from "express";
import { playerStats, topBatsmen, topBowlers, recalculateAllPlayerStats } from "../controllers/statsController.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/top-batsmen", topBatsmen);
router.get("/top-bowlers", topBowlers);
router.get("/players/:playerId", validateObjectId("playerId"), playerStats);

// Admin route to recalculate all player stats from Ball collection
router.post("/recalculate", requireAuth, recalculateAllPlayerStats);

export default router;
