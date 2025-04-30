import { Response } from "express";
import Url from "../models/url";
import { AuthRequest } from "../middleware/authMiddleware";

export const getAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { trimId } = req.params;
        const result = await Url.findOne({ trimId });

        if (!result) {
            res.status(404).json({ error: "Short URL not found." });
            return;
        }

        const clicks = result.history.length;
        const sortedHistory = result.history
            .map(entry => entry.timestamp)
            .sort((a, b) => a - b);

        res.json({
            trimId,
            redirectUrl: result.redirectUrl,
            totalClicks: clicks,
            firstAccess: sortedHistory[0] ? new Date(sortedHistory[0]).toISOString() : "No clicks yet",
            lastAccess: sortedHistory[clicks - 1] ? new Date(sortedHistory[clicks - 1]).toISOString() : "No clicks yet",
            recentAccesses: sortedHistory.slice(-5).map(ts => new Date(ts).toISOString())
        });

    } catch (err) {
        console.error("Error in getAnalysis:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};
