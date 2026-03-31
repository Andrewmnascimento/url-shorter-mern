import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createURL, getURL } from "../controllers/url.controller.js";
import type { RequestHandler } from "express";

const router: Router = Router();
const shortCodePattern = /^[A-Za-z0-9_-]{7}$/;

router.post('/', authMiddleware as RequestHandler ,createURL);
router.get('/:shortURL', (req, res, next) => {
	if (!shortCodePattern.test(req.params.shortURL as string)) {
		return next();
	}

	return getURL(req, res);
});

export default router;
