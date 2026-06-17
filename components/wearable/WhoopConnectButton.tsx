import Link from "next/link";

interface Props {
  connected: boolean;
  lastSyncedAt: Date | null;
}

export default function WhoopConnectButton({ connected, lastSyncedAt }: Props) {
  if (!connected) {
    return (
      <Link
        href="/api/whoop/connect"
        className="inline-block border border-gray-700 text-sm px-4 py-2 rounded-md hover:border-gray-500 transition-colors"
      >
        Connect Whoop
      </Link>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm text-gray-400">
      <span className="h-2 w-2 rounded-full bg-green-500" />
      Whoop connected
      {lastSyncedAt && (
        <span className="text-gray-600">
          · last synced{" "}
          {lastSyncedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      )}
    </span>
  );
}
