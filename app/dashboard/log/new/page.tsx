import { getAllCompounds } from "@/lib/db/queries";
import LogEntryForm from "@/components/log/LogEntryForm";

export default async function NewLogEntryPage() {
  const compounds = await getAllCompounds();

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-semibold">Log an entry</h2>
      <LogEntryForm compounds={compounds} />
    </div>
  );
}
