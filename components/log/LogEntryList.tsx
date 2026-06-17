"use client";

import { useState } from "react";
import type { LogEntry, CompoundLibrary } from "@prisma/client";

type EntryWithCompound = LogEntry & { compound: CompoundLibrary };

function formatDay(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

interface EntryRowProps {
  entry: EntryWithCompound;
  onDelete: (id: string) => void;
}

function EntryRow({ entry, onDelete }: EntryRowProps) {
  const [hovered, setHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/log-entries/${entry.id}`, { method: "DELETE" });
    onDelete(entry.id);
  }

  return (
    <div
      className="px-5 py-4 flex items-start justify-between gap-4 transition-colors hover:bg-gray-900/50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm">{entry.compound.name}</p>
        <p className="text-gray-400 text-sm">
          {entry.amount} {entry.unit}
          <span className="mx-2 text-gray-600">·</span>
          <span className="text-gray-500 capitalize">{entry.compound.category}</span>
        </p>
        {entry.note && (
          <p className="text-gray-500 text-xs mt-1 truncate">{entry.note}</p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {hovered && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
        <time className="text-gray-500 text-xs whitespace-nowrap">
          {formatTime(new Date(entry.timestamp))}
        </time>
      </div>
    </div>
  );
}

export default function LogEntryList({
  entries: initialEntries,
}: {
  entries: EntryWithCompound[];
}) {
  const [entries, setEntries] = useState(initialEntries);

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  if (entries.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-12 text-center">
        No entries yet — hit &ldquo;+ Log entry&rdquo; to start tracking.
      </p>
    );
  }

  // Group by calendar day (entries arrive sorted desc by timestamp)
  const groups: { day: string; label: string; entries: EntryWithCompound[] }[] = [];
  for (const entry of entries) {
    const date = new Date(entry.timestamp);
    const key = dayKey(date);
    const last = groups[groups.length - 1];
    if (last && last.day === key) {
      last.entries.push(entry);
    } else {
      groups.push({ day: key, label: formatDay(date), entries: [entry] });
    }
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.day}>
          {/* Day separator */}
          <div className="flex items-center gap-3 mb-1">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
              {group.label}
            </span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <div className="rounded-xl border border-gray-800 overflow-hidden divide-y divide-gray-800">
            {group.entries.map((entry) => (
              <EntryRow key={entry.id} entry={entry} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
