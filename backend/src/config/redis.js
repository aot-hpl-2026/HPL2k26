import { createClient } from "redis";
import { env } from "./env.js";

export const createRedisClients = async () => {
  // If no Redis URL, return mock clients
  if (!env.redisUrl) {
    console.log("⚠️  No Redis URL configured - using in-memory fallback");
    return createMockRedis();
  }

  try {
    const pubClient = createClient({ 
      url: env.redisUrl,
      socket: {
        keepAlive: 30000,
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.error("Redis: Too many reconnection attempts, using fallback");
            return false; // Stop reconnecting
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });
    const subClient = pubClient.duplicate();

    pubClient.on("error", (err) => console.error("Redis pub error:", err.message));
    subClient.on("error", (err) => console.error("Redis sub error:", err.message));

    await Promise.race([
      Promise.all([pubClient.connect(), subClient.connect()]),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Redis connection timeout")), 10000))
    ]);

    console.log("Redis connected!");
    return { pubClient, subClient };
  } catch (error) {
    console.warn("⚠️  Redis connection failed:", error.message, "- using in-memory fallback");
    return createMockRedis();
  }
};

// Mock Redis for when real Redis is unavailable
function createMockRedis() {
  const store = new Map();
  const subscribers = new Map();
  
  const mockClient = {
    get: async (key) => store.get(key) || null,
    set: async (key, value) => { store.set(key, value); return 'OK'; },
    del: async (key) => { store.delete(key); return 1; },
    subscribe: async (channel, callback) => { subscribers.set(channel, callback); },
    publish: async (channel, message) => { 
      const cb = subscribers.get(channel);
      if (cb) cb(message);
      return 1;
    },
    on: () => {},
    quit: async () => {},
    isOpen: true
  };
  
  return { pubClient: mockClient, subClient: mockClient };
}
