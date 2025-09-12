import { useState } from "react";

export default function FileUpload({ onTextExtracted }) {
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const text = await file.text();
    onTextExtracted(text);
  };

  return (
    <div className="flex flex-col items-center">
      <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition">
        Upload File
        <input type="file" className="hidden" onChange={handleFileChange} />
      </label>
      {fileName && <p className="mt-2 text-gray-600">Uploaded: {fileName}</p>}
    </div>
  );
}
