import { Response } from "express";
import Url from "../models/url";
import { AuthRequest } from "../middleware/authMiddleware";

export const getTrimUrls = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(400).json({ message: "User ID not found in request." });
            return;
        }
        const userUrls = await Url.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("trimId redirectUrl -_id");

        console.log(userUrls);

        res.status(200).json(userUrls);
    } catch (err) {
        console.error("Error in getTrimUrls:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};
