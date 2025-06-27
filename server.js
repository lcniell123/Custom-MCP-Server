// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { runPrompt } from "./agent/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing messages array" });
  }

  try {
    const { content, rawMessage } = await runPrompt(messages);
    res.json({ reply: content, rawMessage });
  } catch (err) {
    console.error("❌ Error in /chat:", err);
    res.status(500).json({ error: "Agent failed to respond" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
