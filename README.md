# MCP Filesystem Assistant with Web UI

This project is a local AI assistant built using:

- [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/servers)
- OpenAI GPT-4o
- An MCP-compatible filesystem server
- A React web frontend

It allows you to query and analyze files stored locally via a chat interface.

---

## ✨ Features

✅ Ask questions about files in `/workspace`  
✅ Automatically read file contents with GPT analysis  
✅ Web-based chat interface  
✅ Modular backend architecture  
✅ Expandable to Azure, Kubernetes, and more

---

## 📂 Project Structure

```
Custom-MCP-Server/
├── agent/                  # Node agent (GPT + tools logic)
│   └── index.js
├── tools/
│   └── filesystem/
│       └── server.js       # MCP-compatible Filesystem Server
├── workspace/              # Files you want the agent to access
│   └── test.txt
├── web/                    # React frontend
│   └── src/
│       └── components/
│           └── ChatInterface.js
├── server.js               # Express backend exposing /chat
├── .env
├── package.json
```

---

## ⚙️ Prerequisites

- Node.js v18+
- An OpenAI API key

---

## 🛠 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/mcp-assistant
   cd mcp-assistant
   ```

2. Install dependencies (root):

   ```bash
   npm install
   ```

3. Install dependencies (frontend):

   ```bash
   cd web
   npm install
   ```

4. Create a `.env` file in the root:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   MCP_FILESYSTEM_URL=http://localhost:4001
   ```

---

## 🚀 Running the App

Open **3 terminals**:

**Terminal 1 – MCP Filesystem Server**

```bash
cd tools/filesystem
node server.js
```

**Terminal 2 – Express Backend**

```bash
cd Custom-MCP-Server
node server.js
```

**Terminal 3 – React Frontend**

```bash
cd web
npm start
```

Frontend: [http://localhost:3000](http://localhost:3000)  
Backend: [http://localhost:4000](http://localhost:4000)

---

## 🧠 How It Works

1. You ask a question in the web chat.
2. The backend (`server.js`) calls `runPrompt()`.
3. GPT determines if it needs to call a tool (`read_file` or `list_files`).
4. The backend performs the tool call and feeds results back into GPT.
5. GPT returns the final answer.
6. The frontend displays it.

---

## 💡 Tips

- Ensure all files you want to query are inside `/workspace`.
- Use `setupProxy.js` or a full URL (`http://localhost:4000/chat`) in `fetch()` to avoid proxy issues.
- Persist conversation history (`messages[]`) if you want contextual memory.

---

## ✅ Next Steps

- Add authentication
- Persist chat history
- Deploy to Azure or Kubernetes
- Support CSV and tabular analysis

---

## License

MIT License
