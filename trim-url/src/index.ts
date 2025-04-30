import express, { Request, Response } from 'express';
// import { connectToMongoose } from './connection/mongoose';
import urlRoute from './routes/url';
import Url from './models/url';
import dotenv from 'dotenv';
import connectDB from './db';
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

const app = express();
const PORT = 8000;

app.use(express.json());

connectDB();

app.use("/", urlRoute)

app.get("/:trimId", async (req: Request, res: Response): Promise<void> => {
    const { trimId } = req.params;
    try {
      const entry = await Url.findOneAndUpdate(
        { trimId },
        { $push: { history: { timestamp: Date.now() } } },
        { new: true }
      );
  
      if (!entry) {
        res.status(404).send("Short URL not found.");
        return;
      }
  
      res.redirect(entry.redirectUrl);
    } catch (error) {
      console.error("Error in redirecting:", error);
      res.status(500).send("Server error.");
    }
})

app.get('/', (_req: Request, res: Response) => {
    res.send('URL Shortener is alive!');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
