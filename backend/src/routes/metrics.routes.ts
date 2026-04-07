import { Router } from "express";
import { metricsAuth } from "../middleware/metricsAuth.middleware.js";
import { metricsController } from "../controllers/metrics.controller.js";

export const metricsRouter: Router = Router();

metricsRouter.get("/", metricsAuth, metricsController);