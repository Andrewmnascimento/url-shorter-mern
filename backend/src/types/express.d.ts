import type { cacheStats } from "../config/stats.js";

declare global {
  namespace Express {
    interface Request {
      stats: cacheStats;
    }
  }
}

export {};