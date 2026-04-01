import { Router } from "express";
import { statsRoute } from "../controllers/admin.controller.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";
import { statsMiddleware } from "../middleware/stats.middleware.js";

export const adminRouter: Router = Router();
 
adminRouter.get("/metrics", adminAuth, statsMiddleware ,statsRoute);
