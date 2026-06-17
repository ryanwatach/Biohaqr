"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { CompoundLibrary } from "@prisma/client";

type SlimCompound = Pick<
  CompoundLibrary,
  "id" | "name" | "category" | "subcategory" | "popularityRank" | "isUserAdded"
>;

type Props = {
  compounds: SlimCompound[];
};

type Category = "supplement" | "peptide" | "trt";

const CATEGORY_LABELS: Record<Category, string> = {
  supplement: "Supplement",
  peptide: "Peptide",
  trt: "TRT",
};

const PRESET_UNITS = ["mg", "g", "mcg", "IU", "ml", "capsule", "tablet", "unit"];

// ── Step 1: Pick compound ─────────────────────────────────────────────────────

function CompoundPicker({
  compounds,
  onSelect,
}: {
  compounds: SlimCompound[];
  onSelect: (c: SlimCompound) => void;
}) {
  const [category, setCategory] = useState<Category>("supplement");
  const [search, setSearch] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<Category>("supplement");
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return compounds
      .filter((c) => c.category === category)
      .filter((c) =>
        search.trim()
          ? c.name.toLowerCase().includes(search.trim().toLowerCase())
          : true
      );
  }, [compounds, category, search]);

  async function handleAddCustom(e: React.FormEvent) {
    e.preventDefault();
    const name = customName.trim();
    if (!name) return;
    setCustomLoading(true);
    setCustomError(null);

    const res = await fetch("/api/compounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category: customCategory }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setCustomError(body.error ?? "Failed to add compound");
      setCustomLoading(false);
      return;
    }

    const compound = await res.json();
    onSelect(compound as SlimCompound);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">What would you like to log?</p>

      {/* Category tabs */}
      <div className="flex gap-0 border-b border-gray-800">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setCategory(cat);
              setSearch("");
              setAddingCustom(false);
            }}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              category === cat
                ? "border-white text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Compound list */}
      <div className="rounded-xl border border-gray-800 overflow-hidden divide-y divide-gray-800 max-h-72 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm py-6 text-center">
            {search ? `No results for "${search}"` : "No compounds in this category"}
          </p>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c)}
              className="w-full text-left px-4 py-3 hover:bg-gray-800/60 transition-colors flex items-center justify-between gap-4"
            >
              <span className="text-sm text-gray-200">{c.name}</span>
              {c.subcategory && (
                <span className="text-xs text-gray-600 whitespace-nowrap shrink-0">
                  {c.subcategory}
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Add custom */}
      {!addingCustom ? (
        <button
          type="button"
          onClick={() => {
            setAddingCustom(true);
            setCustomCategory(category);
          }}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          + Add something not listed
        </button>
      ) : (
        <form onSubmit={handleAddCustom} className="space-y-3 pt-1">
          <p className="text-xs text-gray-500">
            Add a custom entry. It will be saved to your compound library.
          </p>
          <input
            type="text"
            required
            autoFocus
            placeholder="Compound name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
          <div className="flex gap-2 items-center">
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as Category)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            >
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={customLoading || !customName.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              {customLoading ? "Adding…" : "Add & select"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingCustom(false);
                setCustomName("");
                setCustomError(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors px-2"
            >
              Cancel
            </button>
          </div>
          {customError && <p className="text-red-400 text-xs">{customError}</p>}
        </form>
      )}
    </div>
  );
}

// ── Step 2: Log details ───────────────────────────────────────────────────────

function LogDetails({
  compound,
  onBack,
}: {
  compound: SlimCompound;
  onBack: () => void;
}) {
  const router = useRouter();
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
        compoundId: compound.id,
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
      {/* Selected compound header */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="mt-0.5 text-gray-500 hover:text-gray-300 transition-colors text-xs"
        >
          ← Back
        </button>
        <div>
          <p className="font-medium text-sm">{compound.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 capitalize">
            {compound.category}
            {compound.subcategory && (
              <> · {compound.subcategory}</>
            )}
          </p>
        </div>
      </div>

      <hr className="border-gray-800" />

      {/* Amount + unit */}
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
            autoFocus
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
          Note <span className="text-gray-500">(optional)</span>
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

// ── Main component ────────────────────────────────────────────────────────────

export default function LogEntryForm({ compounds }: Props) {
  const [selectedCompound, setSelectedCompound] = useState<SlimCompound | null>(null);

  if (selectedCompound) {
    return (
      <LogDetails
        compound={selectedCompound}
        onBack={() => setSelectedCompound(null)}
      />
    );
  }

  return (
    <CompoundPicker
      compounds={compounds}
      onSelect={setSelectedCompound}
    />
  );
}
