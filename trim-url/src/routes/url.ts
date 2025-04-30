import express from "express";
import { genNewtrimUrl } from "../controllers/url";
import { getAnalysis } from "../controllers/analysis";
import { verifyToken } from "../middleware/authMiddleware";
import { getTrimUrls } from "../controllers/getTrimUrls";


const router = express.Router()

router.post("/url",verifyToken, genNewtrimUrl);
router.get('/analysis/:trimId',verifyToken, getAnalysis);
router.get('/trimUrls', verifyToken, getTrimUrls);

export default router;