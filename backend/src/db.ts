import mongoose from "mongoose";
import { createClient, type RedisClientType } from "redis";
import dotenv from "dotenv";
import { createLogger } from "./utils/logger.js";

dotenv.config({ path : './.env'});

const logger = createLogger("DATABASE");
const mongoURI = process.env.MONGO_URI || "mongodb://database:27017/urlShorterDB";
export const redisClient: RedisClientType = createClient({
  url: "redis://cashe:6379"
})

mongoose.set('sanitizeFilter', true);

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI!);
    logger.info("✅ MongoDB connected successfully");
    await redisClient.connect();
    logger.info("✅ Redis connected succefully");
  } catch (error: any) {
    logger.error(`Connection failed: ${error.message}`);
    logger.info("⏳ Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};