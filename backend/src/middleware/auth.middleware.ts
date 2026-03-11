import type { Request, Response, NextFunction } from "express";
import jwt, { type Jwt } from "jsonwebtoken";


type JwtPayload = { sub: string, email: string};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if(!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or Invalid token" });
  };

  const token = authHeader.split(" ")[1] as string;

  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as JwtPayload;
    (req as any).user = payload;
    next();
  } catch (error){
    return res.status(401).json({ error: error instanceof Error ? error.message : "Invalid token" });
  };
}