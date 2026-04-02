import { type RequestHandler } from "express";
import { jwtVerify } from "jose";
import { User } from "../models/user.model.js";
import type { JwtPayload } from "../types/auth.types.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("ADMIN");

export const adminAuth: RequestHandler = async (req, res, next) => {
  const token = req.cookies.accessToken;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const payload = (await jwtVerify(token, secret)).payload as JwtPayload;
  const user = User.findOne({ email: payload.email });
  if(user.role != "admin"){
    logger.warn(`Admin auth failed`);
    return res.status(400).json({ error: "You aren't admin!! "});
  };
  (req as any).user = user;
  logger.debug(`Admin authenticated ${user.email}`);
  return next();
};