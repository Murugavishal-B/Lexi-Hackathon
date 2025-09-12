import { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";
import Auth from "../components/Auth";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { LogOut, FileText } from "lucide-react";

export default function Home() {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]); // chat bubbles
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const q = query(
        collection(db, "documents"),
        where("uid", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => doc.data());

      // Convert history into chat-like messages
      const mapped = docs.flatMap((doc) => [
        { role: "user", text: doc.text.slice(0, 500) + "..." },
        { role: "ai", text: doc.summary },
      ]);
      setHistory(mapped);
    };
    fetchHistory();
  }, [user]);

  const handleTextExtracted = async (extractedText) => {
    if (!user) {
      alert("Please login first!");
      return;
    }

    // Add user message bubble
    setMessages((prev) => [...prev, { role: "user", text: extractedText }]);
    setLoading(true);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: extractedText }),
    });

    const data = await res.json();
    const aiSummary = data?.candidates?.[0]?.content || "No summary returned";

    // Add AI message bubble
    setMessages((prev) => [...prev, { role: "ai", text: aiSummary }]);
    setLoading(false);

    await addDoc(collection(db, "documents"), {
      uid: user.uid,
      text: extractedText.slice(0, 5000),
      summary: aiSummary,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      {user && (
        <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
          <h2 className="text-lg font-bold mb-4">📜 History</h2>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {history.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  msg.role === "ai" ? "bg-indigo-600" : "bg-gray-700"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Auth />
          </div>
        </div>
      )}

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-100">
        <header className="p-4 shadow bg-white flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">⚖️ Lexi AI</h1>
          {user && (
            <button
              onClick={() => auth.signOut()}
              className="flex items-center gap-2 text-red-600 hover:text-red-800"
            >
              <LogOut size={18} /> Logout
            </button>
          )}
        </header>

        <main className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-gray-500 text-center mt-20">
              <p>Upload a document or paste text to get started 👇</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-md p-3 rounded-xl shadow ${
                    msg.role === "user"
                      ? "bg-indigo-500 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}

          {loading && (
            <p className="text-blue-500 text-center">Analyzing with Lexi AI...</p>
          )}
        </main>

        <footer className="p-4 bg-white border-t">
          {user ? (
            <FileUpload onTextExtracted={handleTextExtracted} />
          ) : (
            <p className="text-center text-gray-600">
              Please sign in with Google to use Lexi.
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
