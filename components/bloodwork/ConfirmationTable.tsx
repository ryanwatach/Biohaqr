"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BiomarkerRow } from "@/lib/knowledge-engine/bloodwork";

export default function ConfirmationTable() {
  const [rows, setRows] = useState<BiomarkerRow[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem("bloodwork-parse-pending");
    if (raw) setRows(JSON.parse(raw));
  }, []);

  function updateRow(index: number, field: keyof BiomarkerRow, value: string | number | null) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setStatus("saving");
    setError("");
    const res = await fetch("/api/bloodwork/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "Save failed");
      return;
    }
    sessionStorage.removeItem("bloodwork-parse-pending");
    setStatus("done");
    router.push("/dashboard/biomarkers");
  }

  if (rows.length === 0) {
    return (
      <p className="text-gray-400 text-sm">
        No parsed data found.{" "}
        <a href="/dashboard/bloodwork" className="underline">
          Upload a PDF
        </a>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Review extracted values — edit or remove any before saving.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-500">
              <th className="pb-2 pr-4 font-medium">Biomarker</th>
              <th className="pb-2 pr-4 font-medium">Value</th>
              <th className="pb-2 pr-4 font-medium">Unit</th>
              <th className="pb-2 pr-4 font-medium">Date</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-800/50">
                <td className="py-2 pr-4">
                  <input
                    value={row.name}
                    onChange={(e) => updateRow(i, "name", e.target.value)}
                    className="bg-transparent border border-gray-700 rounded px-2 py-1 w-full"
                  />
                </td>
                <td className="py-2 pr-4">
                  <input
                    type="number"
                    step="any"
                    value={row.value}
                    onChange={(e) => updateRow(i, "value", parseFloat(e.target.value))}
                    className="bg-transparent border border-gray-700 rounded px-2 py-1 w-24"
                  />
                </td>
                <td className="py-2 pr-4">
                  <input
                    value={row.unit}
                    onChange={(e) => updateRow(i, "unit", e.target.value)}
                    className="bg-transparent border border-gray-700 rounded px-2 py-1 w-24"
                  />
                </td>
                <td className="py-2 pr-4">
                  <input
                    type="date"
                    value={row.date ?? ""}
                    onChange={(e) => updateRow(i, "date", e.target.value || null)}
                    className="bg-transparent border border-gray-700 rounded px-2 py-1"
                  />
                </td>
                <td className="py-2">
                  <button
                    onClick={() => removeRow(i)}
                    className="text-gray-500 hover:text-red-400 transition-colors text-xs"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSave}
        disabled={status === "saving" || rows.length === 0}
        className="bg-white text-black py-2 px-6 rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
      >
        {status === "saving" ? "Saving…" : `Save ${rows.length} value${rows.length !== 1 ? "s" : ""}`}
      </button>
    </div>
  );
}
