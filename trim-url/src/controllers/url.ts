import { Response } from "express";
import Url from "../models/url";
import { AuthRequest } from "../middleware/authMiddleware";

const genRandId = (length: number = 6): string => {//BASE_URL
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

export const genNewtrimUrl = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        console.log("inside genNewtrimUrl");
        
        const { redirectUrl, customId } = req.body as {
            redirectUrl: string;
            customId?: string;
        };

        const userId = req.user?.id;
        console.log("userId ",userId);
        
        if (!redirectUrl || typeof redirectUrl !== "string") {
            res.status(400).json({ error: "Invalid or missing redirect URL." });
            return;
        }

        if (!userId) {
            res.status(401).json({ error: "User not authenticated." });
            return;
        }

        const idPattern = /^[a-zA-Z0-9-_]+$/;
        let trimId = customId?.trim().toLowerCase() || genRandId();

        if (customId && !idPattern.test(customId)) {
            console.log("Custom ID contains invalid characters.");
            
            res.status(400).json({ error: "Custom ID contains invalid characters." });
            return;
        }

        const existing = await Url.findOne({ trimId });
        if (existing) {
            console.log("This short URL ID is already taken.");
            
            res.status(400).json({ error: "This short URL ID is already taken." });
            return;
        }

        const newUrl = new Url({
            trimId,
            redirectUrl,
            user: userId, 
        });

        await newUrl.save();
        res.status(201).json({
            message: "Short URL created successfully.",
            shortUrl: `${req.protocol}://${req.get("host")}/${trimId}`,
            redirectUrl,
        });
    } catch (error) {
        console.error("Error creating short URL:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
