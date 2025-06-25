// agent/index.js

import readline from "readline";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tools = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the contents of a file from the workspace.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file name to read.",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List all files in the workspace directory.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

// 🧠 Memory: stores full conversation
const messages = [
  {
    role: "system",
    content:
      "You are a helpful assistant that uses tools to interact with local files. If given a file's content, analyze it in detail.",
  },
];

async function callFilesystemTool(toolCall) {
  const url = process.env.MCP_FILESYSTEM_URL || "http://localhost:4001";
  const { name, arguments: argsJSON } = toolCall.function;
  const args = JSON.parse(argsJSON);

  try {
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
      return JSON.stringify(json);
    }

    return JSON.stringify({ error: "Unknown tool call" });
  } catch (err) {
    return JSON.stringify({ error: err.message });
  }
}

async function runAgent() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "You: ",
  });

  console.log("💬 Ask me about the files in /workspace. Type `exit` to quit.");
  rl.prompt();

  rl.on("line", async (input) => {
    if (input.trim().toLowerCase() === "exit") {
      rl.close();
      return;
    }

    try {
      messages.push({ role: "user", content: input });

      const initial = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        tools,
        tool_choice: "auto",
      });

      const response = initial.choices[0].message;
      messages.push({ role: "assistant", ...response });

      if (response.tool_calls && response.tool_calls.length > 0) {
        const toolCall = response.tool_calls[0];
        const toolResult = await callFilesystemTool(toolCall);

        console.log("📦 Tool result:", toolResult); // optional: remove for production

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolResult,
        });

        const followUp = await openai.chat.completions.create({
          model: "gpt-4o",
          messages,
        });

        const finalResponse = followUp.choices[0].message;
        messages.push({ role: "assistant", ...finalResponse });

        console.log(`🤖 ${finalResponse.content}`);
      } else {
        console.log(`🤖 ${response.content}`);
      }
    } catch (err) {
      console.error("❌ Error:", err.message);
    }

    rl.prompt();
  });
}

runAgent();
