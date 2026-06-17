import { prisma } from "./client";

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
    orderBy: { name: "asc" },
  });
}
