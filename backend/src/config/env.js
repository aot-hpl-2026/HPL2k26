import dotenv from "dotenv";

dotenv.config();

export const env = {
  // Server
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  
  // Database
  mongoUri: process.env.MONGO_URI,
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  
  // Redis
  redisUrl: process.env.REDIS_URL,
  
  // CORS - in production, should be specific origins
  corsOrigin: process.env.CORS_ORIGIN || "*",
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || "info",

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  }
};

export const isProduction = () => env.nodeEnv === "production";
export const isDevelopment = () => env.nodeEnv === "development";

export const validateEnv = () => {
  const required = ["mongoUri", "jwtSecret"];
  
  // Redis is optional (will use in-memory fallback)
  if (isProduction()) {
    required.push("redisUrl");
  }
  
  const missing = required.filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
  
  // Warn about security in production
  if (isProduction()) {
    if (env.corsOrigin === "*") {
      console.warn("⚠️  Warning: CORS_ORIGIN is set to '*' in production");
    }
    if (env.jwtSecret.length < 32) {
      console.warn("⚠️  Warning: JWT_SECRET should be at least 32 characters in production");
    }
  }
};
