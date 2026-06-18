import { prisma } from "@/lib/db/client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogEntryForm from "@/components/log/LogEntryForm";

export default async function NewLogEntryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const compounds = await prisma.compoundLibrary.findMany({
    where: {
      OR: [{ isUserAdded: true }, { citations: { some: {} } }],
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

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-semibold">Log an entry</h2>
      <LogEntryForm compounds={compounds} />
    </div>
  );
}
