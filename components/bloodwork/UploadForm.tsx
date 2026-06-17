"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange() {
    const file = inputRef.current?.files?.[0];
    setSelectedFile(file ? file.name : null);
    setError("");
    setStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError("");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/bloodwork/upload", { method: "POST", body: form });
    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "Upload failed");
      return;
    }

    sessionStorage.setItem("bloodwork-parse-pending", JSON.stringify(data.rows));
    router.push("/dashboard/bloodwork/confirm");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          id="pdf-input"
          onChange={handleFileChange}
        />
        <label
          htmlFor="pdf-input"
          className="cursor-pointer text-sm text-gray-400 hover:text-white transition-colors"
        >
          {selectedFile ? (
            <span className="text-white">{selectedFile}</span>
          ) : (
            "Click to select a PDF lab report"
          )}
        </label>
        {selectedFile && (
          <p className="text-xs text-gray-500 mt-1">Click to change file</p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === "uploading" || !selectedFile}
        className="w-full bg-white text-black py-2 rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
      >
        {status === "uploading" ? "Parsing…" : "Upload and extract biomarkers"}
      </button>
    </form>
  );
}
