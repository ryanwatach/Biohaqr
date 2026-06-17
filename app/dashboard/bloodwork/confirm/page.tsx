import ConfirmationTable from "@/components/bloodwork/ConfirmationTable";

export default function ConfirmPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Review extracted values</h1>
        <p className="text-sm text-gray-400 mt-1">
          Edit any values before saving. Non-numeric results (ranges, flags) were skipped — add them manually if needed.
        </p>
      </div>
      <ConfirmationTable />
    </div>
  );
}
