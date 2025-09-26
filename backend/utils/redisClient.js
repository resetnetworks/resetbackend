// utils/connectRedis.js
import Redis from "ioredis";

// Global cache for serverless
let redis = null;

const connectRedis = () => {
  // अगर already connected है तो return करें
  if (redis && redis.status === 'ready') {
    return redis;
  }

  try {
    redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
      // Serverless optimized settings
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true, // Connect only when needed
      keepAlive: 30000,
      family: 4, // IPv4
      // Connection timeout settings
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    // Connection event handlers
    redis.on("connect", () => console.log("✅ Redis connected"));
    redis.on("error", (err) => {
      console.error("❌ Redis error:", err);
      redis = null; // Reset connection on error
    });
    redis.on("close", () => {
      console.log("🔌 Redis connection closed");
      redis = null;
    });

    return redis;
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
    redis = null;
    return null;
  }
};

// Helper functions
export const getCached = async (key) => {
  try {
    const redisInstance = connectRedis();
    if (!redisInstance) return null;
    
    const data = await redisInstance.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("❌ Cache get error:", error);
    return null;
  }
};

export const setCached = async (key, value, ttl = 60) => {
  try {
    const redisInstance = connectRedis();
    if (!redisInstance) return false;
    
    await redisInstance.set(key, JSON.stringify(value), "EX", ttl);
    return true;
  } catch (error) {
    console.error("❌ Cache set error:", error);
    return false;
  }
};

// Export instance getter
export const getRedisInstance = () => connectRedis();

export default connectRedis;
