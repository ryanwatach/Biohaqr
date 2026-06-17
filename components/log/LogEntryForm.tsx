"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CompoundLibrary } from "@prisma/client";

type Props = {
  compounds: CompoundLibrary[];
};

const PRESET_UNITS = ["mg", "g", "mcg", "IU", "ml", "capsule", "tablet"];

export default function LogEntryForm({ compounds }: Props) {
  const router = useRouter();
  const [compoundId, setCompoundId] = useState(compounds[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("mg");
  const [customUnit, setCustomUnit] = useState("");
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const effectiveUnit = unit === "__custom__" ? customUnit : unit;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/log-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compoundId,
        amount: Number(amount),
        unit: effectiveUnit,
        timestamp,
        note: note || undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to save entry");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="compound" className="block text-sm text-gray-300 mb-1">
          Compound
        </label>
        <select
          id="compound"
          required
          value={compoundId}
          onChange={(e) => setCompoundId(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        >
          {compounds.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="amount" className="block text-sm text-gray-300 mb-1">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            required
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="unit" className="block text-sm text-gray-300 mb-1">
            Unit
          </label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            {PRESET_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
            <option value="__custom__">Other…</option>
          </select>
        </div>
      </div>

      {unit === "__custom__" && (
        <div>
          <label htmlFor="customUnit" className="block text-sm text-gray-300 mb-1">
            Custom unit
          </label>
          <input
            id="customUnit"
            type="text"
            required
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value)}
            placeholder="e.g. drops, sprays"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      <div>
        <label htmlFor="timestamp" className="block text-sm text-gray-300 mb-1">
          Date & time
        </label>
        <input
          id="timestamp"
          type="datetime-local"
          required
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="note" className="block text-sm text-gray-300 mb-1">
          Note{" "}
          <span className="text-gray-500">(optional)</span>
        </label>
        <textarea
          id="note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          {loading ? "Saving…" : "Log entry"}
        </button>
        <a
          href="/dashboard"
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
