import { Router } from "express";
import { list } from "../controllers/pointsController.js";

const router = Router();

router.get("/", list);

export default router;
