// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import fetch from "node-fetch";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const workspacePath = path.join(process.cwd(), "workspace");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, workspacePath),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Define GPT tools
const tools = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the contents of a file from the workspace.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Name of the file" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List files in the workspace directory.",
      parameters: { type: "object", properties: {} },
    },
  },
];

// Helper to call the filesystem server
async function callFilesystemTool(toolCall) {
  const url = process.env.MCP_FILESYSTEM_URL || "http://localhost:4001";
  const { name, arguments: argsJSON } = toolCall.function;
  const args = JSON.parse(argsJSON);

  if (name === "list_files") {
    const res = await fetch(`${url}/list`);
    const json = await res.json();
    return JSON.stringify(json);
  }

  if (name === "read_file") {
    const res = await fetch(
      `${url}/read?path=${encodeURIComponent(args.path)}`
    );
    const json = await res.json();
    return json.content || JSON.stringify(json);
  }

  return JSON.stringify({ error: "Unknown tool call" });
}

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing messages array." });
  }

  try {
    // First GPT call
    const initial = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools,
      tool_choice: "auto",
    });

    const response = initial.choices[0].message;

    // If no tool call, return the reply
    if (!response.tool_calls || response.tool_calls.length === 0) {
      return res.json({ reply: response.content, rawMessage: response });
    }

    // Tool call detected
    const toolCall = response.tool_calls[0];
    const toolResult = await callFilesystemTool(toolCall);

    // Build messages for follow-up
    const followupMessages = [
      ...messages,
      { role: "assistant", tool_calls: [toolCall] },
      { role: "tool", tool_call_id: toolCall.id, content: toolResult },
    ];

    // Second GPT call with tool result
    const followup = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: followupMessages,
    });

    const finalResponse = followup.choices[0].message;

    res.json({ reply: finalResponse.content, rawMessage: finalResponse });
  } catch (err) {
    console.error("❌ Error in /chat:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/delete", (req, res) => {
  const filePath = path.join(workspacePath, req.query.path || "");

  // Security check
  if (!filePath.startsWith(workspacePath)) {
    return res.status(403).json({ error: "Unauthorized path." });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("❌ Delete error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "File deleted successfully." });
  });
});

// File upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  res.json({
    message: `File "${req.file.originalname}" uploaded successfully.`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
