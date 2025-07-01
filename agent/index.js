// agent/index.js

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
      return json.content || JSON.stringify(json);
    }

    return JSON.stringify({ error: "Unknown tool call" });
  } catch (err) {
    return JSON.stringify({ error: err.message });
  }
}

export async function runPrompt(chatMessages = []) {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant that can read and analyze local files when needed.",
    },
    ...chatMessages
      .filter(
        (m) =>
          m.role && typeof m.content === "string" && m.content.trim() !== ""
      )
      .map((m) => ({
        role: m.role,
        content: m.content,
        tool_calls: m.tool_calls,
        name: m.name,
        tool_call_id: m.tool_call_id,
      })),
  ];

  const initial = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    tools,
    tool_choice: "auto",
  });

  const response = initial.choices[0].message;

  messages.push({
    role: "assistant",
    content: response.content ?? null,
    tool_calls: response.tool_calls ?? undefined,
  });

  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];
    const toolResult = await callFilesystemTool(toolCall);

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

    return {
      content: finalResponse.content,
      rawMessage: finalResponse,
    };
  }

  return {
    content: response.content,
    rawMessage: response,
  };
}
