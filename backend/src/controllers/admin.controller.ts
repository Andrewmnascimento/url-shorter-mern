import type { RequestHandler } from "express";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("ADMIN");

export const statsRoute: RequestHandler = (req, res) => {
  const user = (req as any).user as { email?: string ,role?: string } | undefined ;
  logger.debug(`Admin requested status ${user?.email}`);
  const stats = req.stats.getMetrics();
  res.status(200).json(stats);
}