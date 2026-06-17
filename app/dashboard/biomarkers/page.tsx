import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getBiomarkerTypes,
  getBiomarkersByType,
  getBiomarkerDates,
  getBiomarkersByDate,
  getWearableConnection,
} from "@/lib/db/queries";
import BiomarkerChart from "@/components/biomarkers/BiomarkerChart";
import SnapshotTable from "@/components/biomarkers/SnapshotTable";
import WhoopConnectButton from "@/components/wearable/WhoopConnectButton";
import SyncButton from "@/components/wearable/SyncButton";

interface Props {
  searchParams: { view?: string; date?: string; type?: string };
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BiomarkersPage({ searchParams }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [dates, types, whoopConn] = await Promise.all([
    getBiomarkerDates(user.id),
    getBiomarkerTypes(user.id),
    getWearableConnection(user.id, "whoop"),
  ]);

  const hasData = dates.length > 0;
  const view = searchParams.view ?? "snapshot";

  // Snapshot tab
  const selectedDate = searchParams.date ?? dates[0] ?? null;
  const snapshotRows = view === "snapshot" && selectedDate
    ? await getBiomarkersByDate(user.id, selectedDate)
    : [];

  // Trends tab
  const selectedType = searchParams.type ?? types[0] ?? null;
  const trendRows = view === "trends" && selectedType
    ? await getBiomarkersByType(user.id, selectedType)
    : [];
  const chartData = trendRows.map((b) => ({
    date: b.date.toISOString().slice(0, 10),
    value: b.value,
  }));
  const unit = trendRows[0]?.unit ?? "";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Biomarkers</h1>
        <div className="flex flex-wrap items-center gap-3">
          <WhoopConnectButton
            connected={!!whoopConn}
            lastSyncedAt={whoopConn?.lastSyncedAt ?? null}
          />
          {whoopConn && <SyncButton />}
        </div>
      </div>

      {!hasData ? (
        <div className="border border-gray-800 rounded-lg p-8 text-center space-y-3">
          <p className="text-gray-400 text-sm">No biomarker data yet.</p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/dashboard/bloodwork" className="underline text-gray-300">
              Upload bloodwork
            </Link>
            <span className="text-gray-600">or connect Whoop to sync recovery data</span>
          </div>
        </div>
      ) : (
        <>
          {/* Tab switcher */}
          <div className="flex gap-0 border-b border-gray-800">
            <Link
              href={`/dashboard/biomarkers?view=snapshot${selectedDate ? `&date=${selectedDate}` : ""}`}
              className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
                view === "snapshot"
                  ? "border-white text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              Snapshot
            </Link>
            <Link
              href={`/dashboard/biomarkers?view=trends${selectedType ? `&type=${encodeURIComponent(selectedType)}` : ""}`}
              className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
                view === "trends"
                  ? "border-white text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              Trends
            </Link>
          </div>

          {/* ── Snapshot ── */}
          {view === "snapshot" && (
            <div className="space-y-5">
              {dates.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {dates.map((d) => (
                    <Link
                      key={d}
                      href={`/dashboard/biomarkers?view=snapshot&date=${d}`}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        d === selectedDate
                          ? "border-white text-white"
                          : "border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      {formatDate(d)}
                    </Link>
                  ))}
                </div>
              )}

              {selectedDate && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedDate)}
                    <span className="mx-2 text-gray-700">·</span>
                    {snapshotRows.length} markers
                  </p>
                  <SnapshotTable biomarkers={snapshotRows} />
                </div>
              )}
            </div>
          )}

          {/* ── Trends ── */}
          {view === "trends" && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {types.map((t) => (
                  <Link
                    key={t}
                    href={`/dashboard/biomarkers?view=trends&type=${encodeURIComponent(t)}`}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      t === selectedType
                        ? "border-white text-white"
                        : "border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {t}
                  </Link>
                ))}
              </div>

              {selectedType && (
                <div className="space-y-2">
                  <h2 className="text-sm font-medium text-gray-300">{selectedType}</h2>
                  <BiomarkerChart data={chartData} unit={unit} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
