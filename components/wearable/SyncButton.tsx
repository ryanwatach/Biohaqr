"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton() {
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSync() {
    setStatus("syncing");
    setMessage("");
    const res = await fetch("/api/whoop/sync", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "Sync failed");
      return;
    }
    setStatus("done");
    setMessage(`Synced ${data.synced} data point${data.synced !== 1 ? "s" : ""}`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={status === "syncing"}
        className="border border-gray-700 text-sm px-4 py-2 rounded-md hover:border-gray-500 disabled:opacity-50 transition-colors"
      >
        {status === "syncing" ? "Syncing…" : "Sync now"}
      </button>
      {message && (
        <span className={`text-sm ${status === "error" ? "text-red-400" : "text-gray-400"}`}>
          {message}
        </span>
      )}
    </div>
  );
}
