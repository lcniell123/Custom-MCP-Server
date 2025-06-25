# MCP Filesystem Localized Server Connect

This is a local AI assistant built using the [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/servers), OpenAI's GPT-4o, and a filesystem server. It allows you to query and analyze files stored locally through a command-line chatbot.

<img width="726" alt="Screenshot 2025-06-25 at 4 41 32 PM" src="https://github.com/user-attachments/assets/610e074e-aecc-4281-97c5-360ad84d0546" />


## Features

- Ask questions about files in your local `/workspace` directory
- Automatically invokes tools to list or read files
- Persistent memory within a single session
- Character analysis and content summaries using GPT
- Expandable to support databases, Azure, Kubernetes, or web interfaces

## Prerequisites

- Node.js v18+
- A valid OpenAI API key

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/mcp-assistant
   cd mcp-assistant
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   MCP_FILESYSTEM_URL=http://localhost:4001
   FILESYSTEM_PORT=4001
   FS_DIR=./workspace
   ```

4. Create the `/workspace` folder and add test files (e.g., `test.txt`):

   ```bash
   mkdir workspace
   echo "hellohello" > workspace/test.txt
   ```

## Running the Assistant

1. Start the filesystem server:

   ```bash
   node tools/filesystem/server.js
   ```

2. In a separate terminal, start the agent:

   ```bash
   node agent/index.js
   ```

3. Begin chatting:

   ```
   You: list all files
   You: read test.txt
   You: how many characters?
   You: what is the most used letter?
   ```

## Project Structure

```
.
├── agent
│   └── index.js         # Chat agent CLI using OpenAI + MCP tools
├── tools
│   └── filesystem
│       └── server.js    # MCP-compatible local file server
├── workspace            # Local files you want the agent to read
├── .env
└── README.md
```

## Known Issues

- Files outside the `workspace` folder are blocked for security
- Tool use is limited to reading and listing for now
- Memory is session-based only (not persistent across restarts)

## Next Steps

- Add support for CSV and tabular file summarization
- Build a web-based interface
- Integrate Azure Blob Storage and Kubernetes for multi-user expansion

## License

MIT License. Use at your own risk.
