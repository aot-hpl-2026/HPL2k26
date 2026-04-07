import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/health" || req.path === "/api/health";
  }
});

// Stricter limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts, please try again later" }
});
