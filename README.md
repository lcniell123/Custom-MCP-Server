# MCP Filesystem Assistant with Web UI

This project is a local AI assistant that lets you:

✅ Query and analyze files stored in `/workspace`  
✅ Upload and delete files via a modern web interface  
✅ Use GPT-4o to summarize or answer questions about your files  
✅ Easily extend to Azure, Kubernetes, or more secure setups

---

## ✨ Features

- 📂 List and delete files in your workspace
- 📝 Upload files via a drag-and-drop UI
- 💬 Chat with GPT-4o about file contents
- ⚡ Clean, mobile-friendly frontend
- 🔐 (Optional) Add authentication for security

---

## 📂 Project Structure

```
Custom-MCP-Server/
├── agent/                  # Node agent (GPT + tools logic)
│   └── index.js
├── tools/
│   └── filesystem/
│       └── server.js       # MCP-compatible Filesystem Server
├── workspace/              # Files you want the assistant to access
│   └── test.txt
├── web/                    # React frontend
│   └── src/
│       └── components/
│           └── ChatInterface.js
├── server.js               # Express backend exposing /chat and /upload
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

3. Install frontend dependencies:

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
node server.js
```

**Terminal 3 – React Frontend**

```bash
cd web
npm start
```

Frontend: [http://localhost:3000](http://localhost:3000)  
Backend API: [http://localhost:4000](http://localhost:4000)  
Filesystem API: [http://localhost:4001](http://localhost:4001)

---

## 🧠 How It Works

1. You ask a question in the web chat.
2. The backend (`server.js`) calls GPT-4o with tool definitions.
3. GPT either:
   - Replies directly, or
   - Calls tools (`read_file`, `list_files`) via MCP.
4. If a tool call is needed, the backend:
   - Requests file content or file list from the filesystem server.
   - Sends the result back into GPT for a final answer.
5. The frontend displays GPT's reply.

---

## 🖼 Web UI Overview

- Clean, responsive chat interface
- Upload files into `/workspace`
- List and delete workspace files inline
- Works great on desktop & mobile

---

## 💡 Tips

- All files must be in `/workspace` to be accessible.
- To avoid CORS issues, always start all servers and use the correct ports.
- You can customize styles with Tailwind CSS or your own CSS.

---

## ✅ Next Steps

- Add authentication with API keys or sessions.
- Deploy to Azure or Kubernetes.
- Extend tool capabilities (e.g., CSV analysis).
- Persist chat history.

---

## License

MIT License
