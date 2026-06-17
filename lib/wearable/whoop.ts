const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
const WHOOP_API_BASE = "https://api.prod.whoop.com/developer/v1";
const SCOPES = "offline read:recovery read:cycles read:body_measurement";

export interface WhoopTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface WhoopRecoveryEntry {
  date: string;
  recoveryScore: number;
  hrvRmssd: number;
  restingHeartRate: number;
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.WHOOP_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/whoop/callback`,
    response_type: "code",
    scope: SCOPES,
    state,
  });
  return `${WHOOP_AUTH_URL}?${params}`;
}

export async function exchangeCode(code: string): Promise<WhoopTokens> {
  const res = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.WHOOP_CLIENT_ID!,
      client_secret: process.env.WHOOP_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/whoop/callback`,
    }),
  });
  if (!res.ok) throw new Error(`Whoop token exchange failed: ${res.status}`);
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<WhoopTokens> {
  const res = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.WHOOP_CLIENT_ID!,
      client_secret: process.env.WHOOP_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) throw new Error(`Whoop token refresh failed: ${res.status}`);
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

export async function fetchRecovery(
  accessToken: string,
  startDate: Date
): Promise<WhoopRecoveryEntry[]> {
  const params = new URLSearchParams({
    start: startDate.toISOString(),
    limit: "25",
  });
  const res = await fetch(
    `${WHOOP_API_BASE}/recovery/collection?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) throw new Error(`Whoop recovery fetch failed: ${res.status}`);
  const data = await res.json();

  const entries: WhoopRecoveryEntry[] = [];
  for (const r of data.records ?? []) {
    const score = r.score;
    if (!score) continue;
    if (
      typeof score.recovery_score !== "number" ||
      typeof score.hrv_rmssd_milli !== "number" ||
      typeof score.resting_heart_rate !== "number"
    )
      continue;
    entries.push({
      date: (r.created_at ?? r.start).slice(0, 10),
      recoveryScore: score.recovery_score,
      hrvRmssd: score.hrv_rmssd_milli,
      restingHeartRate: score.resting_heart_rate,
    });
  }
  return entries;
}
