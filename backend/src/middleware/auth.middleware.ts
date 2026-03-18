import type { Request, Response, NextFunction } from "express-serve-static-core";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types/auth.types.ts";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("AUTH");

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as JwtPayload;
    (req as any).user = payload;
    logger.debug(`User authenticated: ${payload.email}`);
    next();
  } catch (error){
    const errorMessage = error instanceof Error ? error.message : "Invalid token";
    logger.warn(`Authentication failed: ${errorMessage}`);
    res.status(401).json({ error: errorMessage });
    return;
  };
}
