import { Router } from "express";
import { 
  create, 
  update, 
  list, 
  getById, 
  score, 
  getLiveScore, 
  getFullLiveState,
  saveScoringProgress,
  getScoringProgress,
  completeMatch,
  endInnings,
  remove, 
  startInnings, 
  changeBowler, 
  newBatsman, 
  liveMatches, 
  upcomingMatches, 
  completedMatches, 
  matchesByTeam 
} from "../controllers/matchController.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import { scoringLimiter } from "../middlewares/rateLimit.js";
import { validate, matchSchemas } from "../middlewares/validate.js";

const router = Router();

// Public routes (anyone can view)
router.get("/", list);
router.get("/live", liveMatches);
router.get("/upcoming", upcomingMatches);
router.get("/completed", completedMatches);
router.get("/team/:teamId", validateObjectId("teamId"), matchesByTeam);
router.get("/:matchId", validateObjectId("matchId"), getById);
router.get("/:matchId/live", validateObjectId("matchId"), getLiveScore);
router.get("/:matchId/live-state", validateObjectId("matchId"), getFullLiveState);

// Admin routes (require authentication)
router.post("/", requireAuth, validate(matchSchemas.create), create);
router.put("/:matchId", requireAuth, validateObjectId("matchId"), validate(matchSchemas.update), update);
router.delete("/:matchId", requireAuth, validateObjectId("matchId"), remove);

// Live scoring routes (authenticated + rate limited)
router.post("/:matchId/score", requireAuth, validateObjectId("matchId"), scoringLimiter, validate(matchSchemas.score), score);
router.post("/:matchId/start-innings", requireAuth, validateObjectId("matchId"), startInnings);
router.post("/:matchId/end-innings", requireAuth, validateObjectId("matchId"), endInnings);
router.post("/:matchId/change-bowler", requireAuth, validateObjectId("matchId"), changeBowler);
router.post("/:matchId/new-batsman", requireAuth, validateObjectId("matchId"), newBatsman);

// Scoring state persistence routes (admin only)
router.post("/:matchId/scoring-state", requireAuth, validateObjectId("matchId"), saveScoringProgress);
router.get("/:matchId/scoring-state", requireAuth, validateObjectId("matchId"), getScoringProgress);

// Match completion route (admin only - updates stats, clears cache)
router.post("/:matchId/complete", requireAuth, validateObjectId("matchId"), completeMatch);

export default router;
