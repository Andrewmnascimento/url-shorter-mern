import type { Request, Response, NextFunction } from "express";
import jwt, { type Jwt } from "jsonwebtoken";
import type { JwtPayload } from "../types/auth.types.ts";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as JwtPayload;
    (req as any).user = payload;
    next();
  } catch (error){
    return res.status(401).json({ error: error instanceof Error ? error.message : "Invalid token" });
  };
}