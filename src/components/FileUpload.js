// src/components/FileUpload.js
import { useState } from "react";

export default function FileUpload({ onSubmit }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleSend = async () => {
    if (text.trim()) {
      onSubmit({ type: "text", content: text });
      setText("");
      return;
    }
    if (!file) return;

    // get local preview URL for images/pdf preview
    const fileURL = URL.createObjectURL(file);

    // try reading text (works for .txt; for full pdf/docx extraction use pdfjs/mammoth)
    let content = "";
    try { content = await file.text(); } catch (e) { content = ""; }

    onSubmit({
      type: "file",
      fileName: file.name,
      fileType: file.type,
      fileURL,
      content,
    });
    setFile(null);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`p-3 border rounded ${dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
    >
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or drop a file..."
          className="flex-1 p-2 border rounded"
        />
        <input id="fileInput" type="file" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        <label htmlFor="fileInput" className="px-3 py-2 bg-gray-200 rounded cursor-pointer">📎</label>
        <button onClick={handleSend} className="px-4 py-2 bg-indigo-600 text-white rounded">Send</button>
      </div>
      {file && <div className="mt-2 text-sm text-gray-600">Selected: {file.name}</div>}
    </div>
  );
}
