import express from "express";
import http from "http";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import { connectDb } from "./config/db.js";
import { createRedisClients } from "./config/redis.js";
import { env, validateEnv, isProduction } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimit.js";
import { initSockets } from "./sockets/index.js";
import { setRuntime } from "./services/runtime.js";

const app = express();

// Validate environment variables early
validateEnv();

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: isProduction() ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({ 
  origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(","),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Compression for responses
app.use(compression());

// Body parsing with limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Logging (different format for production)
app.use(morgan(isProduction() ? "combined" : "dev"));

// Rate limiting for all API routes
app.use("/api", apiLimiter);

// Health check endpoint (no rate limiting)
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

const server = http.createServer(app);

// Graceful shutdown handler
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async () => {
    console.log("HTTP server closed");
    
    try {
      // Close database connections
      const mongoose = await import("mongoose");
      await mongoose.default.connection.close();
      console.log("MongoDB connection closed");
      
      console.log("Graceful shutdown completed");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
};

const start = async () => {
  try {
    console.log(`Starting HPL Backend in ${env.nodeEnv} mode...`);
    
    console.log("Connecting to MongoDB...");
    await connectDb();
    console.log("MongoDB connected!");

    console.log("Connecting to Redis...");
    const redis = await createRedisClients();

    const io = await initSockets(server, redis);
    setRuntime({ io, redis });

    server.listen(env.port, () => {
      console.log(`✅ HPL backend listening on port ${env.port}`);
      console.log(`   Environment: ${env.nodeEnv}`);
      console.log(`   Health check: http://localhost:${env.port}/health`);
    });

    // Handle server errors
    server.on("error", (err) => {
      console.error("Server error:", err);
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${env.port} is already in use`);
        process.exit(1);
      }
    });

    // Graceful shutdown handlers
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Error handlers
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();
