import { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";
import Auth from "../components/Auth";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Home() {
  const [user] = useAuthState(auth);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
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
      setHistory(querySnapshot.docs.map(doc => doc.data()));
    };
    fetchHistory();
  }, [user]);

  const handleTextExtracted = async (extractedText) => {
    if (!user) {
      alert("Please login first!");
      return;
    }

    setText(extractedText);
    setLoading(true);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: extractedText })
    });

    const data = await res.json();
    const aiSummary = data?.candidates?.[0]?.content || "No summary returned";
    setSummary(aiSummary);
    setLoading(false);

    await addDoc(collection(db, "documents"), {
      uid: user.uid,
      text: extractedText.slice(0, 5000),
      summary: aiSummary,
      timestamp: Date.now()
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-indigo-600">Lexi - AI Legal Co-Pilot ⚖️</h1>

      <Auth />

      {user && (
        <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-md">
          <FileUpload onTextExtracted={handleTextExtracted} />

          {loading && (
            <p className="text-center text-blue-500 font-medium mt-4">Analyzing with Lexi AI...</p>
          )}

          {summary && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">AI Summary</h2>
              <p className="bg-gray-100 p-4 rounded-lg">{summary}</p>
            </div>
          )}
        </div>
      )}

      {user && (
        <div className="w-full max-w-2xl mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your History</h2>
          <div className="space-y-4">
            {history.map((doc, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
              >
                <p className="font-medium">{doc.summary}</p>
                <span className="text-sm text-gray-500">
                  {new Date(doc.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
