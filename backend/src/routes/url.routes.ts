import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createURL, getURL } from "../controllers/url.controller.js";
import type { RequestHandler } from "express";

const router: Router = Router();
const shortCodePattern = /^[A-Za-z0-9_-]{7}$/;
const reservedPaths = new Set(["auth", "admin", "metrics", "dashboard"]);

router.post('/', authMiddleware as RequestHandler ,createURL);
router.get('/:shortURL', (req, res, next) => {
	const shortURL = (req.params.shortURL as string).toLowerCase();

	if (reservedPaths.has(shortURL) || !shortCodePattern.test(shortURL)) {
		return next();
	}

	return getURL(req, res, next);
});

export default router;
