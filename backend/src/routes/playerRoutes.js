import { Router } from "express";
import { create, update, getById, list, remove, updateStats, topBatsmen, topBowlers } from "../controllers/playerController.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateObjectId } from "../middlewares/validateObjectId.js";
import { validate, playerSchemas } from "../middlewares/validate.js";
import { uploadPlayerPhoto } from "../config/cloudinary.js";
import { mapFileToField } from "../middlewares/handleUpload.js";

const router = Router();

// Public routes
router.get("/", list);
router.get("/top-batsmen", topBatsmen);
router.get("/top-bowlers", topBowlers);
router.get("/:playerId", validateObjectId("playerId"), getById);

// Admin routes
router.post("/", requireAuth, uploadPlayerPhoto.single('image'), mapFileToField('imageUrl'), validate(playerSchemas.create), create);
router.put("/:playerId", requireAuth, uploadPlayerPhoto.single('image'), mapFileToField('imageUrl'), validateObjectId("playerId"), validate(playerSchemas.update), update);
router.put("/:playerId/stats", requireAuth, validateObjectId("playerId"), updateStats);
router.delete("/:playerId", requireAuth, validateObjectId("playerId"), remove);

export default router;
