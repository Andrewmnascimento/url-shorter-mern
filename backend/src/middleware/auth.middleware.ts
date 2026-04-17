import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import type { JwtPayload } from "../types/auth.types.ts";
import { createLogger } from "../utils/logger.js";
import type { RequestHandler } from "express";
import dotenv from "dotenv";

dotenv.config({ path : '../.env'})

const logger = createLogger("AUTH");

export const authMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  if (!token || typeof token !== 'string') {
    return res.status(401).json({ message: 'Token não fornecido ou inválido' });
  }
  if (!process.env.JWT_SECRET) {
    logger.error("JWT_SECRET não está definido nas variáveis de ambiente!");
    return res.status(500).json({ error: "Internal server error" });
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  try{
    const { payload } = await jwtVerify(token, secret);
    const userPayload = payload as JwtPayload;
    if (!userPayload?.email) {
      logger.warn("Authentication failed: missing email in token payload");
      return res.status(401).json({ error: "Invalid token" });
    }
    (req as any).user = userPayload;
    logger.debug(`User authenticated: ${userPayload.email}`);
    return next();
  } catch (error){
    const errorMessage = error instanceof Error ? error.message : "Invalid token";
    logger.warn(`Authentication failed: ${errorMessage}`);
    return res.status(401).json({ error: errorMessage });
    
  };
}
