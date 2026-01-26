import { Router } from "express";
import { create, update, list, getById, remove, pointsTable, updateStats } from "../controllers/teamController.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import { validate, teamSchemas } from "../middlewares/validate.js";

const router = Router();

// Public routes
router.get("/", list);
router.get("/points-table", pointsTable);
router.get("/:teamId", validateObjectId("teamId"), getById);

// Admin routes (require authentication)
router.post("/", requireAuth, validate(teamSchemas.create), create);
router.put("/:teamId", requireAuth, validateObjectId("teamId"), validate(teamSchemas.update), update);
router.put("/:teamId/stats", requireAuth, validateObjectId("teamId"), validate(teamSchemas.updateStats), updateStats);
router.delete("/:teamId", requireAuth, validateObjectId("teamId"), remove);

export default router;
