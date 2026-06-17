import UploadForm from "@/components/bloodwork/UploadForm";

export default function BloodworkPage() {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold">Upload bloodwork</h1>
        <p className="text-sm text-gray-400 mt-1">
          Upload a PDF lab report. Values are extracted and shown for review before saving.
        </p>
      </div>
      <UploadForm />
    </div>
  );
}
