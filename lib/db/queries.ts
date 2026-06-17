import { prisma } from "./client";
import type { BiomarkerRow } from "@/lib/knowledge-engine/bloodwork";

// ── Log entries ───────────────────────────────────────────────────────────────

export async function getUserLogEntries(userId: string) {
  return prisma.logEntry.findMany({
    where: { userId },
    include: { compound: true },
    orderBy: { timestamp: "desc" },
  });
}

export async function createLogEntry(
  userId: string,
  data: {
    compoundId: string;
    amount: number;
    unit: string;
    timestamp: string;
    note?: string;
  }
) {
  return prisma.logEntry.create({
    data: {
      userId,
      compoundId: data.compoundId,
      amount: data.amount,
      unit: data.unit,
      timestamp: new Date(data.timestamp),
      note: data.note,
    },
    include: { compound: true },
  });
}

export async function getAllCompounds() {
  return prisma.compoundLibrary.findMany({
    orderBy: [{ popularityRank: "asc" }, { name: "asc" }],
  });
}

// ── Biomarkers ────────────────────────────────────────────────────────────────

export async function createBiomarkers(
  userId: string,
  rows: BiomarkerRow[],
  source: string
) {
  return prisma.biomarker.createMany({
    data: rows.map((r) => ({
      userId,
      type: r.name,
      value: r.value,
      unit: r.unit,
      date: r.date ? new Date(r.date) : new Date(new Date().setHours(0, 0, 0, 0)),
      source,
    })),
    skipDuplicates: true,
  });
}

export async function getBiomarkerTypes(userId: string) {
  const groups = await prisma.biomarker.groupBy({
    by: ["type"],
    where: { userId },
    orderBy: { type: "asc" },
  });
  return groups.map((g) => g.type);
}

export async function getBiomarkersByType(userId: string, type: string) {
  return prisma.biomarker.findMany({
    where: { userId, type },
    orderBy: { date: "asc" },
  });
}

export async function getBiomarkerDates(userId: string): Promise<string[]> {
  const rows = await prisma.biomarker.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: "desc" },
  });
  const seen = new Set<string>();
  const dates: string[] = [];
  for (const r of rows) {
    const day = r.date.toISOString().slice(0, 10);
    if (!seen.has(day)) {
      seen.add(day);
      dates.push(day);
    }
  }
  return dates;
}

export async function getBiomarkersByDate(userId: string, dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);
  return prisma.biomarker.findMany({
    where: { userId, date: { gte: start, lte: end } },
    orderBy: { type: "asc" },
  });
}

// ── Correlations ─────────────────────────────────────────────────────────────

export async function getLogEntriesInRange(userId: string, start: Date, end: Date) {
  return prisma.logEntry.findMany({
    where: { userId, timestamp: { gte: start, lte: end } },
    include: { compound: { select: { name: true } } },
    orderBy: { timestamp: "asc" },
  });
}

export async function getCompoundsWithLogs(userId: string) {
  const entries = await prisma.logEntry.findMany({
    where: { userId },
    include: { compound: { select: { id: true, name: true } } },
    distinct: ["compoundId"],
    orderBy: { compound: { name: "asc" } },
  });
  return entries.map((e) => ({ id: e.compoundId, name: e.compound.name }));
}

export async function getEarliestLogEntry(userId: string, compoundId: string) {
  return prisma.logEntry.findFirst({
    where: { userId, compoundId },
    orderBy: { timestamp: "asc" },
  });
}

export async function getBiomarkersInRange(
  userId: string,
  type: string,
  start: Date,
  end: Date
) {
  return prisma.biomarker.findMany({
    where: { userId, type, date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });
}

export async function getOtherCompoundsInWindow(
  userId: string,
  compoundId: string,
  windowStart: Date,
  windowEnd: Date
): Promise<string[]> {
  const entries = await prisma.logEntry.findMany({
    where: {
      userId,
      compoundId: { not: compoundId },
      timestamp: { gte: windowStart, lte: windowEnd },
    },
    include: { compound: { select: { name: true } } },
    distinct: ["compoundId"],
  });
  return entries.map((e) => e.compound.name);
}

// ── Wearable connections ──────────────────────────────────────────────────────

export async function getWearableConnection(userId: string, provider: string) {
  return prisma.wearableConnection.findUnique({
    where: { userId_provider: { userId, provider } },
  });
}

export async function upsertWearableConnection(
  userId: string,
  provider: string,
  data: {
    encryptedAccessToken: string;
    encryptedRefreshToken: string;
    tokenExpiresAt: Date;
    lastSyncedAt?: Date;
  }
) {
  return prisma.wearableConnection.upsert({
    where: { userId_provider: { userId, provider } },
    create: { userId, provider, ...data },
    update: data,
  });
}
