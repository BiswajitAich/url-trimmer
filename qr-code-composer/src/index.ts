import express, { Request, Response } from "express";
import qrcode from "qrcode";
import dotenv from "dotenv";
import { verifyToken } from "./middleware/authentication";
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

const app = express()
const PORT = process.env.PORT || 8001;
app.use(express.json())

app.post("/qr", verifyToken, (req: Request, res: Response) => {

    const { url, html, header, color } = req.body as {
        url?: string,
        html?: boolean,
        header?: string,
        color?: {
            dark?: string,
            light?: string
        }
    };
    console.log(url, html, header);
    if (!url) {
        res.status(400).send({ status: "error", message: "Missing 'url' in request body." });
        return;
    }
    qrcode.toDataURL(url, {
        color: {
            dark: color?.dark || '#000000',
            light: color?.light || '#ffffff'
        }
    }, (err, qrDataUrl: string) => {
        if (err) {
            res.status(500).send({ status: "error", message: "QR code generation failed." });
            return;
        }

        if (html) {
            const head = header || "QR CODE of the url " + url;
            return res.send({
                status: "ok",
                type: "html",
                data: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>QR CODE</title>
                    </head>
                    <body>
                        <h1>${head}</h1>
                        <img src="${qrDataUrl}" alt="QR Code"/>
                    </body>
                    </html>`
            });
        }
        return res.send({
            status: "ok",
            type: "img",
            data: qrDataUrl
        });
    })
});

app.get('/', (_req: Request, res: Response) => {
    res.send('QR Code Composer api is alive!');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});