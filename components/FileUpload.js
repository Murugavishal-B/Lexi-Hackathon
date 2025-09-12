import { useState } from "react";

export default function FileUpload({ onTextExtracted }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleSend = async () => {
    if (text.trim()) {
      onTextExtracted({ type: "text", content: text });
      setText("");
    } else if (file) {
      const fileText = await file.text();
      onTextExtracted({
        type: "file",
        fileName: file.name,
        fileType: file.type,
        content: fileText,
        fileURL: URL.createObjectURL(file),
      });
      setFile(null);
    }
  };

  return (
    <div
      className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-4 transition ${
        dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <div className="flex w-full items-center gap-2">
        <input
          type="text"
          placeholder="Type your text here or upload a file..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border p-2 rounded-lg"
        />

        <input
          type="file"
          accept=".txt,.pdf,.docx,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="bg-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-300"
        >
          📎
        </label>

        <button
          onClick={handleSend}
          disabled={!text.trim() && !file}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition disabled:opacity-50"
        >
          ➤
        </button>
      </div>

      {dragging && <p className="text-sm text-indigo-600">Drop your file here</p>}
      {file && (
        <p className="text-sm text-gray-600 mt-2">Selected: {file.name}</p>
      )}
    </div>
  );
}
