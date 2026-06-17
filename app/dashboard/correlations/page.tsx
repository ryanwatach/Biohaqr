import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getBiomarkerTypes,
  getBiomarkersByType,
  getLogEntriesInRange,
  getCompoundsWithLogs,
} from "@/lib/db/queries";
import TimelineChart from "@/components/correlations/TimelineChart";
import BeforeAfterComparison from "@/components/correlations/BeforeAfterComparison";

interface Props {
  searchParams: { biomarker?: string };
}

export default async function CorrelationsPage({ searchParams }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [biomarkerTypes, compoundsWithLogs] = await Promise.all([
    getBiomarkerTypes(user.id),
    getCompoundsWithLogs(user.id),
  ]);

  const selectedBiomarker = searchParams.biomarker ?? biomarkerTypes[0] ?? null;

  // Timeline data
  const biomarkerRows = selectedBiomarker
    ? await getBiomarkersByType(user.id, selectedBiomarker)
    : [];

  const chartData = biomarkerRows.map((b) => ({
    date: b.date.toISOString().slice(0, 10),
    value: b.value,
  }));

  const unit = biomarkerRows[0]?.unit ?? "";

  // Log entry overlays — fetch for the same date span as the biomarker data
  const logMarkers: { date: string; entries: { compound: string; amount: number; unit: string }[] }[] = [];

  if (biomarkerRows.length > 0) {
    const earliest = biomarkerRows[0].date;
    const latest = biomarkerRows[biomarkerRows.length - 1].date;
    const logEntries = await getLogEntriesInRange(user.id, earliest, latest);

    // Group by date
    const byDate = new Map<string, { compound: string; amount: number; unit: string }[]>();
    for (const e of logEntries) {
      const day = e.timestamp.toISOString().slice(0, 10);
      if (!byDate.has(day)) byDate.set(day, []);
      byDate.get(day)!.push({
        compound: e.compound.name,
        amount: e.amount,
        unit: e.unit,
      });
    }
    for (const [date, entries] of Array.from(byDate.entries())) {
      logMarkers.push({ date, entries });
    }
  }

  const isEmpty = biomarkerTypes.length === 0 && compoundsWithLogs.length === 0;

  return (
    <div className="space-y-10">
      <h1 className="text-xl font-semibold">Correlations</h1>

      {isEmpty ? (
        <div className="border border-gray-800 rounded-lg p-8 text-center space-y-3">
          <p className="text-gray-400 text-sm">No data yet.</p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/dashboard/bloodwork" className="underline text-gray-300">
              Upload bloodwork
            </Link>
            <span className="text-gray-600">and</span>
            <Link href="/dashboard/log/new" className="underline text-gray-300">
              Log some compounds
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ── Timeline ── */}
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-medium">Biomarker timeline</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Amber lines mark dates when you logged a compound. Hover for details.
              </p>
            </div>

            {biomarkerTypes.length === 0 ? (
              <p className="text-gray-600 text-sm">Upload bloodwork to see biomarker trends.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {biomarkerTypes.map((t) => (
                    <Link
                      key={t}
                      href={`/dashboard/correlations?biomarker=${encodeURIComponent(t)}`}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        t === selectedBiomarker
                          ? "border-white text-white"
                          : "border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      {t}
                    </Link>
                  ))}
                </div>

                {selectedBiomarker && (
                  <TimelineChart
                    data={chartData}
                    logMarkers={logMarkers}
                    unit={unit}
                  />
                )}
              </>
            )}
          </section>

          <hr className="border-gray-800" />

          {/* ── Before / After ── */}
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-medium">Before / after comparison</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Pick a compound. The marker is its earliest log entry. Averages show
                biomarker values N days before and after that date.
              </p>
            </div>

            {compoundsWithLogs.length === 0 ? (
              <p className="text-gray-600 text-sm">
                <Link href="/dashboard/log/new" className="underline">
                  Log a compound
                </Link>{" "}
                to run a before/after comparison.
              </p>
            ) : biomarkerTypes.length === 0 ? (
              <p className="text-gray-600 text-sm">
                Upload bloodwork to compare against compound logs.
              </p>
            ) : (
              <BeforeAfterComparison
                compounds={compoundsWithLogs}
                initialBiomarker={selectedBiomarker ?? undefined}
                biomarkerTypes={biomarkerTypes}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
