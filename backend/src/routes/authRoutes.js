import { Router } from "express";
import { login } from "../controllers/authController.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { validate, authSchemas } from "../middlewares/validate.js";

const router = Router();

// Login with rate limiting and validation
router.post("/login", authLimiter, validate(authSchemas.login), login);

export default router;
