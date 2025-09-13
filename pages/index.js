// pages/index.js
import { useEffect, useState } from "react";
import FileUpload from "../src/components/FileUpload";
import Auth from "../src/components/Auth";
import { auth } from "../src/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { loadMessages, saveMessage } from "../src/lib/firestore";

export default function Home() {
  const [user, loadingUser] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!user) { setMessages([]); return; }
    (async () => {
      const saved = await loadMessages(user.uid);
      setMessages(saved.map(m => ({ role: m.sender || "user", ...m })));
    })();
  }, [user]);

  const handleSubmit = async (payload) => {
    // payload: { type: "text"|"file", content, fileName, fileURL, fileType }
    if (!user) { alert("Sign in first"); return; }

    const userMessage = {
      sender: "user",
      type: payload.type,
      content: payload.content || "",
      fileName: payload.fileName || null,
      fileURL: payload.fileURL || null,
      fileType: payload.fileType || null,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, { ...userMessage, role: "user" }]);
    await saveMessage(user.uid, userMessage);

    // Call server analyze route
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMessage.content, fileName: userMessage.fileName })
      });
      const json = await res.json();
      const aiText = json?.summary || json?.result || "No analysis returned";

      const aiMessage = {
        sender: "ai",
        type: "ai",
        content: aiText,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, { ...aiMessage, role: "ai" }]);
      await saveMessage(user.uid, aiMessage);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "ai", content: "Error analyzing document." }]);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-72 p-4 border-r">
        <h2 className="text-xl font-bold">Lexi</h2>
        <div className="mt-6">
          <Auth />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 && (<div className="text-center text-gray-500">No messages yet — upload a doc or type text.</div>)}

          {messages.map((m, idx) => (
            <div key={idx} className={`max-w-2xl ${m.role === "user" ? "ml-auto text-right" : ""}`}>
              <div className={`inline-block p-3 rounded ${m.role === "user" ? "bg-indigo-500 text-white" : "bg-white shadow"}`}>
                {m.fileURL ? (<div><a href={m.fileURL} target="_blank" rel="noreferrer">{m.fileName}</a></div>) : null}
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}
        </main>

        <footer className="p-4 border-t">
          <FileUpload onSubmit={handleSubmit} />
          {analyzing && <div className="text-sm text-blue-500 mt-2">Analyzing...</div>}
        </footer>
      </div>
    </div>
  );
}
