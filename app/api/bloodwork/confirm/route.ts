import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBiomarkers } from "@/lib/db/queries";
import { z } from "zod";

const BodySchema = z.object({
  rows: z.array(
    z.object({
      name: z.string().min(1),
      value: z.number(),
      unit: z.string().min(1),
      date: z.string().nullable(),
    })
  ),
});

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await createBiomarkers(user.id, parsed.data.rows, "bloodwork");
  return NextResponse.json({ count: result.count });
}
