import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWearableConnection, upsertWearableConnection, createBiomarkers } from "@/lib/db/queries";
import { decrypt, encrypt } from "@/lib/wearable/encryption";
import { fetchRecovery, refreshAccessToken } from "@/lib/wearable/whoop";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conn = await getWearableConnection(user.id, "whoop");
  if (!conn) {
    return NextResponse.json({ error: "No Whoop connection found" }, { status: 404 });
  }

  let accessToken = decrypt(conn.encryptedAccessToken);
  let refreshToken = decrypt(conn.encryptedRefreshToken);

  if (conn.tokenExpiresAt < new Date()) {
    const refreshed = await refreshAccessToken(refreshToken);
    accessToken = refreshed.accessToken;
    refreshToken = refreshed.refreshToken;
    await upsertWearableConnection(user.id, "whoop", {
      encryptedAccessToken: encrypt(refreshed.accessToken),
      encryptedRefreshToken: encrypt(refreshed.refreshToken),
      tokenExpiresAt: refreshed.expiresAt,
    });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const entries = await fetchRecovery(accessToken, thirtyDaysAgo);

  const rows = entries.flatMap((e) => [
    { name: "whoop_recovery_score", value: e.recoveryScore, unit: "score", date: e.date },
    { name: "whoop_hrv_rmssd", value: e.hrvRmssd, unit: "ms", date: e.date },
    { name: "whoop_resting_hr", value: e.restingHeartRate, unit: "bpm", date: e.date },
  ]);

  const result = await createBiomarkers(user.id, rows, "wearable");

  await upsertWearableConnection(user.id, "whoop", {
    encryptedAccessToken: encrypt(accessToken),
    encryptedRefreshToken: encrypt(refreshToken),
    tokenExpiresAt: conn.tokenExpiresAt,
    lastSyncedAt: new Date(),
  });

  return NextResponse.json({ synced: result.count });
}
