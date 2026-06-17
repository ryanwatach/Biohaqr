import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserLogEntries, createLogEntry } from "@/lib/db/queries";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await getUserLogEntries(user.id);
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.compoundId || body.amount == null || !body.unit) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const entry = await createLogEntry(user.id, {
    compoundId: body.compoundId,
    amount: Number(body.amount),
    unit: body.unit,
    timestamp: body.timestamp ?? new Date().toISOString(),
    note: body.note,
  });

  return NextResponse.json(entry, { status: 201 });
}
