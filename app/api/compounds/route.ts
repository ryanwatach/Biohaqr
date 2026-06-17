import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search")?.trim() ?? undefined;

  const compounds = await prisma.compoundLibrary.findMany({
    where: {
      ...(category && { category: category as never }),
      ...(search && {
        name: { contains: search, mode: "insensitive" as never },
      }),
    },
    select: {
      id: true,
      name: true,
      category: true,
      subcategory: true,
      popularityRank: true,
      isUserAdded: true,
    },
    orderBy: [{ popularityRank: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(compounds);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = (body?.name ?? "").trim();
  const category = body?.category ?? "supplement";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const valid = ["supplement", "peptide", "trt"];
  if (!valid.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  // Reuse existing compound if name matches (case-insensitive)
  const existing = await prisma.compoundLibrary.findFirst({
    where: { name: { equals: name, mode: "insensitive" as never } },
    select: { id: true, name: true, category: true, subcategory: true, isUserAdded: true },
  });
  if (existing) return NextResponse.json(existing, { status: 200 });

  const compound = await prisma.compoundLibrary.create({
    data: {
      name,
      category: category as never,
      mechanismSummary: "User-added compound — no mechanism summary on file.",
      isUserAdded: true,
    },
    select: { id: true, name: true, category: true, subcategory: true, isUserAdded: true },
  });

  return NextResponse.json(compound, { status: 201 });
}
