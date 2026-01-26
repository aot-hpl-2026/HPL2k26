import { ApiError } from "../utils/apiError.js";
import { isProduction } from "../config/env.js";
import mongoose from "mongoose";

export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  if (!isProduction() || err.status >= 500) {
    console.error(`[${new Date().toISOString()}] Error:`, {
      message: err.message,
      status: err.status,
      path: req.path,
      method: req.method,
      stack: isProduction() ? undefined : err.stack
    });
  }

  // Handle specific error types
  let status = err.status || 500;
  let message = err.message || "Internal server error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    status = 400;
    const messages = Object.values(err.errors).map(e => e.message);
    message = messages.join(", ");
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with this ${field} already exists`;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    status = 400;
    message = "Invalid ID format";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired, please login again";
  }

  // Joi validation error
  if (err.isJoi) {
    status = 400;
    message = err.details?.map(d => d.message).join(", ") || "Validation error";
  }

  // Don't leak internal error details in production
  if (isProduction() && status >= 500) {
    message = "An unexpected error occurred. Please try again later.";
  }

  res.status(status).json({ 
    success: false, 
    message,
    ...(isProduction() ? {} : { stack: err.stack })
  });
};

export const notFound = (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.path} not found` 
  });
};

// Async handler wrapper to catch errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
