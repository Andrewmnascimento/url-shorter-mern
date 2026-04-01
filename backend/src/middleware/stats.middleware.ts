import type { NextFunction, Request, Response } from "express";
import type { cacheStats } from "../config/stats.js";

export const statsMiddleware = (stats: cacheStats) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.stats = stats;
    next();
  }
}