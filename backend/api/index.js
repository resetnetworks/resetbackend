// File: api/index.js
import dotenv from 'dotenv';
dotenv.config();

import connectDb from "../utils/connectDb.js";
import connectRedis from "../utils/redisClient.js"; // Add Redis
import app from '../app.js';

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Database connection
    await connectDb();
    
    // Redis connection (optional - won't fail if Redis is down)
    connectRedis();
    
    // Express app को serverless function के रूप में use करें
    return app(req, res);
  } catch (error) {
    console.error('❌ Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
