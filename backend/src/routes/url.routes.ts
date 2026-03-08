import { Router } from "express";
import { createURL, getURL } from "../controllers/url.controller.js";

const router: Router = Router();

router.post('/', createURL);
router.get('/:shortURL', getURL);

export default router;