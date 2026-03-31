import { Router } from "express";
import { dashboardRoute } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const dashboardRouter: Router = Router();

dashboardRouter.get("/", authMiddleware ,dashboardRoute);