import { Router } from "express";
import { create, update, getById, list, remove, updateStats, topBatsmen, topBowlers } from "../controllers/playerController.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import { validate, playerSchemas } from "../middlewares/validate.js";

const router = Router();

// Public routes
router.get("/", list);
router.get("/top-batsmen", topBatsmen);
router.get("/top-bowlers", topBowlers);
router.get("/:playerId", validateObjectId("playerId"), getById);

// Admin routes
router.post("/", requireAuth, validate(playerSchemas.create), create);
router.put("/:playerId", requireAuth, validateObjectId("playerId"), validate(playerSchemas.update), update);
router.put("/:playerId/stats", requireAuth, validateObjectId("playerId"), updateStats);
router.delete("/:playerId", requireAuth, validateObjectId("playerId"), remove);

export default router;
