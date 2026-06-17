import type { LogEntry, CompoundLibrary } from "@prisma/client";

type EntryWithCompound = LogEntry & { compound: CompoundLibrary };

type Props = {
  entries: EntryWithCompound[];
};

export default function LogEntryList({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-12 text-center">
        No entries yet — hit &ldquo;+ Log entry&rdquo; to start tracking.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-800 rounded-xl border border-gray-800 overflow-hidden">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="px-5 py-4 flex items-start justify-between gap-4"
        >
          <div className="min-w-0">
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
          <time className="text-gray-500 text-xs whitespace-nowrap flex-shrink-0">
            {new Date(entry.timestamp).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </div>
      ))}
    </div>
  );
}
