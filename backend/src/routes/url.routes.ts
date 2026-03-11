import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createURL, getURL } from "../controllers/url.controller.js";

const router: Router = Router();

router.post('/', authMiddleware ,createURL);
router.get('/:shortURL', getURL);

export default router;