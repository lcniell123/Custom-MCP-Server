import { useState } from "react";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

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
      const botMessage = data.rawMessage; // this preserves tool_calls
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Error: " + err.message,
        },
      ]);
    } finally {
      setLoading(false);
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
      ></textarea>
      <button
        onClick={sendMessage}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        Send
      </button>
    </div>
  );
}
