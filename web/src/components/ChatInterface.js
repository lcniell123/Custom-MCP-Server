import { useState, useEffect } from "react";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  // Fetch files when the component mounts
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const res = await fetch("http://localhost:4001/list");
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error("Error loading files:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      const botMessage = data.rawMessage || {
        role: "assistant",
        content: data.reply || "No response",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error: " + err.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async () => {
    if (!file) return alert("Please select a file first.");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      alert(data.message || "Upload complete");
      setFile(null);
      loadFiles();
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  };

  const deleteFile = async (filename) => {
    if (!window.confirm(`Delete "${filename}"?`)) return;
    console.log("", encodeURIComponent(filename));
    try {
      const res = await fetch(
        `http://localhost:4000/delete?path=${encodeURIComponent(filename)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      alert(data.message || "File deleted.");
      loadFiles();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue-100 self-end"
                : "bg-gray-200 self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="self-start text-gray-500">GPT is thinking...</div>
        )}
      </div>

      <textarea
        className="border rounded-md p-2 w-full resize-none"
        rows={2}
        value={input}
        placeholder="Ask about a file..."
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="flex space-x-2 mt-2">
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          Send
        </button>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border rounded-md px-2 py-2"
        />

        <button
          onClick={uploadFile}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Upload
        </button>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold mb-2">Workspace Files:</h2>
        {files.length === 0 && <p className="text-gray-500">No files found.</p>}
        <ul className="space-y-1">
          {files.map((file) => (
            <button
              onClick={() => deleteFile(file.name)}
              className="text-red-600 hover:underline"
            >
              {file.name} ❌
            </button>
          ))}
        </ul>
      </div>
    </div>
  );
}
