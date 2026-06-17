import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserLogEntries } from "@/lib/db/queries";
import LogEntryList from "@/components/log/LogEntryList";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const entries = await getUserLogEntries(user!.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Stack Log</h2>
        <Link
          href="/dashboard/log/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          + Log entry
        </Link>
      </div>
      <LogEntryList entries={entries} />
    </div>
  );
}
