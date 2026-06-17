import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getEarliestLogEntry,
  getBiomarkersInRange,
  getOtherCompoundsInWindow,
  getCompoundsWithLogs,
} from "@/lib/db/queries";

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const compoundId = searchParams.get("compoundId");
  const biomarker = searchParams.get("biomarker");
  const window = parseInt(searchParams.get("window") ?? "14", 10);

  if (!compoundId || !biomarker) {
    return NextResponse.json({ error: "compoundId and biomarker required" }, { status: 400 });
  }

  const windowDays = Math.max(7, Math.min(90, window));

  const earliest = await getEarliestLogEntry(user.id, compoundId);
  if (!earliest) {
    return NextResponse.json({ error: "No log entries for this compound" }, { status: 404 });
  }

  const markerDate = earliest.timestamp;
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const windowStart = new Date(markerDate.getTime() - windowMs);
  const windowEnd = new Date(markerDate.getTime() + windowMs);

  const [beforeRows, afterRows, otherCompounds, compounds] = await Promise.all([
    getBiomarkersInRange(user.id, biomarker, windowStart, markerDate),
    getBiomarkersInRange(user.id, biomarker, markerDate, windowEnd),
    getOtherCompoundsInWindow(user.id, compoundId, windowStart, windowEnd),
    getCompoundsWithLogs(user.id),
  ]);

  const selectedCompound = compounds.find((c) => c.id === compoundId);

  return NextResponse.json({
    markerDate: markerDate.toISOString(),
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    windowDays,
    beforeAvg: avg(beforeRows.map((b) => b.value)),
    beforeCount: beforeRows.length,
    afterAvg: avg(afterRows.map((b) => b.value)),
    afterCount: afterRows.length,
    unit: beforeRows[0]?.unit ?? afterRows[0]?.unit ?? "",
    otherCompounds,
    selectedCompoundName: selectedCompound?.name ?? "",
  });
}
