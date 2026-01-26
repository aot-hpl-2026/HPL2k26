import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { recordBall } from "../services/scoringService.js";
import { 
  saveLiveScore, 
  saveLiveState, 
  getLiveState,
  saveScoringState,
  buildLiveData 
} from "../services/liveScoreCache.js";
import Match from "../models/Match.js";

export const initSockets = async (httpServer, redis) => {
  const io = new Server(httpServer, {
    cors: { origin: env.corsOrigin },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Only use Redis adapter if real Redis clients are properly connected
  const hasRealRedis = redis.pubClient && 
                       typeof redis.pubClient.duplicate === 'function' &&
                       redis.pubClient.isOpen;
  
  if (hasRealRedis) {
    try {
      io.adapter(createAdapter(redis.pubClient, redis.subClient));
      console.log("Socket.IO using Redis adapter");
    } catch (err) {
      console.warn("Socket.IO Redis adapter failed, using in-memory:", err.message);
    }
  } else {
    console.log("Socket.IO using in-memory adapter (no Redis)");
  }

  const publicNs = io.of("/public");
  const adminNs = io.of("/admin");

  adminNs.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));
      jwt.verify(token, env.jwtSecret);
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  adminNs.on("connection", (socket) => {
    console.log("[Socket] Admin connected:", socket.id);

    socket.on("score:update", async (payload, callback) => {
      try {
        const result = await recordBall(payload.matchId, payload.ball);
        
        // Build comprehensive live update data
        const liveData = buildLiveData(result.match);
        liveData.lastBall = result.ball;

        // Cache in Redis
        if (redis.pubClient) {
          await saveLiveScore(redis.pubClient, payload.matchId, liveData);
          await saveLiveState(redis.pubClient, payload.matchId, liveData);
        }
        
        // Broadcast to all public clients watching this match
        publicNs.to(payload.matchId).emit("score:update", liveData);
        
        // Also emit to global namespace for match list updates
        publicNs.emit("score:update", liveData);

        callback?.({ success: true, data: result });
      } catch (error) {
        console.error("[Socket] Score update error:", error.message);
        callback?.({ success: false, message: error.message });
      }
    });

    // Save scoring state for admin resumption
    socket.on("scoring:save", async (payload, callback) => {
      try {
        if (redis.pubClient) {
          await saveScoringState(redis.pubClient, payload.matchId, payload.state);
        }
        callback?.({ success: true });
      } catch (error) {
        console.error("[Socket] Save scoring state error:", error.message);
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("innings:start", async (payload, callback) => {
      try {
        // Handle innings initialization
        const { initializeInnings } = await import("../services/scoringService.js");
        const result = await initializeInnings(
          payload.matchId,
          payload.battingTeamId,
          payload.bowlingTeamId,
          payload.openers,
          payload.bowler
        );
        
        // Build and cache live data
        const liveData = buildLiveData(result);
        if (redis.pubClient) {
          await saveLiveState(redis.pubClient, payload.matchId, liveData);
        }
        
        // Broadcast match started
        publicNs.emit("match:started", { matchId: payload.matchId, liveData });
        publicNs.to(payload.matchId).emit("innings:started", { matchId: payload.matchId, liveData });
        
        callback?.({ success: true, data: result });
      } catch (error) {
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Admin disconnected:", socket.id);
    });
  });

  publicNs.on("connection", (socket) => {
    console.log("[Socket] Public client connected:", socket.id);

    // When client subscribes, send them the current match state
    socket.on("subscribe", async (matchId) => {
      socket.join(matchId);
      console.log("[Socket] Client subscribed to match:", matchId);
      
      // Send current match state immediately upon subscription
      try {
        let liveData = null;
        
        // Try cache first
        if (redis.pubClient) {
          liveData = await getLiveState(redis.pubClient, matchId);
        }
        
        // If not in cache, get from DB
        if (!liveData) {
          const match = await Match.findById(matchId)
            .populate('teamA', 'name shortName logo primaryColor')
            .populate('teamB', 'name shortName logo primaryColor')
            .lean();
          
          if (match && match.status === 'live') {
            liveData = buildLiveData(match);
            // Cache it
            if (redis.pubClient) {
              await saveLiveState(redis.pubClient, matchId, liveData);
            }
          }
        }
        
        if (liveData) {
          socket.emit("score:update", liveData);
        }
      } catch (error) {
        console.error("[Socket] Error sending initial state:", error.message);
      }
    });

    socket.on("unsubscribe", (matchId) => {
      socket.leave(matchId);
      console.log("[Socket] Client unsubscribed from match:", matchId);
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Public client disconnected:", socket.id);
    });
  });

  return io;
};
