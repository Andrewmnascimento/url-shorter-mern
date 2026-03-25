import type { Request, Response, NextFunction } from "express";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("HTTP");

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const method = req.method;
  const path = req.path;

  logger.request(method, path);
  
  const originalSend = res.send;
  
  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    logger.request(method, path, statusCode, duration);
    
    if (statusCode >= 400) {
      logger.warn(`Request failed: ${method} ${path} - Status: ${statusCode}`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};
