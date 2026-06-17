import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parsePDF } from "@/lib/knowledge-engine/bloodwork";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file || file.type !== "application/pdf") {
    return NextResponse.json({ error: "PDF file required" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const storageKey = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error: uploadError } = await supabase.storage
    .from("bloodwork-uploads")
    .upload(storageKey, buffer, { contentType: "application/pdf" });

  if (uploadError && process.env.NODE_ENV === "development") {
    console.warn("[bloodwork] Storage skipped:", uploadError.message);
  }

  let rows;
  try {
    rows = await parsePDF(buffer);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Parse error";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  return NextResponse.json({ storageKey, rows });
}
