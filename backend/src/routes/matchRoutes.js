import { Router } from "express";
import {
  create,
  update,
  list,
  getById,
  submitMatchStats,
  updateMatchStats,
  remove,
  liveMatches,
  upcomingMatches,
  completedMatches,
  matchesByTeam
} from "../controllers/matchController.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import { validate, matchSchemas } from "../middlewares/validate.js";

const router = Router();

// Public routes
router.get("/", list);
router.get("/live", liveMatches);
router.get("/upcoming", upcomingMatches);
router.get("/completed", completedMatches);
router.get("/team/:teamId", validateObjectId("teamId"), matchesByTeam);
router.get("/:matchId", validateObjectId("matchId"), getById);

// Admin routes
router.post("/", requireAuth, validate(matchSchemas.create), create);
router.put("/:matchId", requireAuth, validateObjectId("matchId"), validate(matchSchemas.update), update);
router.delete("/:matchId", requireAuth, validateObjectId("matchId"), remove);

// Submit match stats (admin only) — auto-calculates all player/team stats
router.post("/:matchId/stats", requireAuth, validateObjectId("matchId"), submitMatchStats);
// Edit already-submitted match stats
router.put("/:matchId/stats", requireAuth, validateObjectId("matchId"), updateMatchStats);

export default router;
