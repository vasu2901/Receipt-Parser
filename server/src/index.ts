import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);



const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview"
});

const DB_PATH = "./receipts.json";

function saveReceipt(receipt: any) {
    const existing = fs.existsSync(DB_PATH)
        ? JSON.parse(fs.readFileSync(DB_PATH, "utf-8"))
        : [];

    existing.push(receipt);

    fs.writeFileSync(DB_PATH, JSON.stringify(existing, null, 2));
}

app.post("/parse-receipt", upload.single("receipt"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const base64 = req.file.buffer.toString("base64");

        const prompt = `
Extract receipt data and return ONLY valid JSON.

Schema:
{
  "merchant": string,
  "date": string,
  "items": [
    {
      "name": string,
      "amount": number
    }
  ],
  "total": number
}
`;

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype
            }
        };

        const result = await model.generateContent([
            prompt,
            imagePart
        ]);

        console.log(result)

        const text = result.response.text();

        console.log(text)

        // Remove markdown fences if Gemini adds them
        const cleaned = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        console.log(cleaned)

        const parsed = JSON.parse(cleaned);

        return res.json(parsed);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to parse receipt" });
    }
});

app.post("/save-receipt", (req, res) => {
    saveReceipt(req.body);
    res.json({ success: true });
});

app.get("/receipts", (_, res) => {
    const receipts = fs.existsSync(DB_PATH)
        ? JSON.parse(fs.readFileSync(DB_PATH, "utf-8"))
        : [];

    res.json(receipts);
});

app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});