import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from 'bcrypt';
import User from "./models/user";
import connectDB from "./db";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });


connectDB();
const PORT = process.env.PORT || 8003;

const app = express();
app.use(express.json())

app.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const SECRET_KEY = process.env.SECRET_KEY;
    if (!email || !password) {
        res.status(400).json({ "error": "Missing fields" });
        return;
    }

    if (!SECRET_KEY) {
        console.log("SECRET_KEY not found!");
        res.status(500).json({ "error": "server error" });
        return;
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ "error": "User not found" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(403).json({ "error": "Invalid credentials" });
            return;
        }

        const token = jwt.sign({ id: user._id, email }, SECRET_KEY!, { expiresIn: "1h" });
        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send(JSON.stringify({ "error": "Login failed" }));
    }
})
app.post("/signup", async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const SECRET_KEY = process.env.SECRET_KEY;
    console.log("process.env.SECRET_KEY:", process.env.SECRET_KEY);
    console.log("username, email, password", username, email, password);

    if (!username || !email || !password) {
        res.status(400).send(JSON.stringify({ "error": "Missing fields" }));
        return;
    }

    if (!SECRET_KEY) {
        console.log("SECRET_KEY not found!");
        res.status(400).send(JSON.stringify({ "error": "server error" }));
        return;
    }
    try {
        console.log("Checking existing users...");
        if (await User.findOne({ email })) {
            console.log("Email already exists");
            res.status(409).send(JSON.stringify({ "error": "Email already registered" }));
            return;
        }

        if (await User.findOne({ username })) {
            console.log("username already exists");
            res.status(409).send(JSON.stringify({ "error": "User Name already taken try another one!" }));
            return;
        }
        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword });

        console.log("Generating token...");
        const token = jwt.sign({ id: user._id, email }, SECRET_KEY!, { expiresIn: "1h" });
        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).send(JSON.stringify({ "error": "Signup failed" }));
    }
})

app.get("/", (_req: Request, res: Response) => {
    res.send('AUTH SERVICE Bottle neck is alive');
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})