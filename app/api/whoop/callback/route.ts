import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCode } from "@/lib/wearable/whoop";
import { encrypt } from "@/lib/wearable/encryption";
import { upsertWearableConnection } from "@/lib/db/queries";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", appUrl));

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = cookies().get("whoop_oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      new URL("/dashboard/biomarkers?error=oauth_state", appUrl)
    );
  }

  cookies().delete("whoop_oauth_state");

  let tokens;
  try {
    tokens = await exchangeCode(code);
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/biomarkers?error=token_exchange", appUrl)
    );
  }

  await upsertWearableConnection(user.id, "whoop", {
    encryptedAccessToken: encrypt(tokens.accessToken),
    encryptedRefreshToken: encrypt(tokens.refreshToken),
    tokenExpiresAt: tokens.expiresAt,
  });

  return NextResponse.redirect(new URL("/dashboard/biomarkers?connected=whoop", appUrl));
}
