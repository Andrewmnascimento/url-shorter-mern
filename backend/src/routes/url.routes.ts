import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createURL, getURL } from "../controllers/url.controller.js";
import type { RequestHandler } from "express-serve-static-core";

const router = Router();

router.post('/', authMiddleware as RequestHandler ,createURL);
router.get('/:shortURL', getURL);

export default router;
