import { useState } from "react";
import { UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../services/api.js";

export default function FileUploader({ uid, onUploaded }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  function getUploadErrorMessage(error) {
    const message = String(error?.message || "");

    if (message.includes("Failed to fetch")) {
      return "The backend upload service is unreachable. Make sure Flask is running on http://localhost:5000.";
    }

    return message || "Upload failed. Check Firebase Storage setup and try again.";
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file || !uid) return;

    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Upload a PDF or image file.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setProgress(35);

    api
      .uploadReport(uid, file)
      .then((uploadedFile) => {
        setProgress(100);
        setUploading(false);
        toast.success("Report uploaded");
        onUploaded?.(uploadedFile);
      })
      .catch((error) => {
        setUploading(false);
        setProgress(0);
        toast.error(getUploadErrorMessage(error));
      });
  }

  return (
    <label className="block cursor-pointer rounded-3xl border border-dashed border-slate-300 bg-white/70 p-5 transition hover:border-health-sky hover:bg-white dark:border-white/15 dark:bg-white/10 dark:hover:border-health-sky dark:hover:bg-white/15">
      <input
        type="file"
        accept="application/pdf,image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-health-green">
          <UploadCloud size={22} className="text-emerald-700" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink dark:text-slate-100">Upload lab reports</p>
          <p className="text-sm text-muted dark:text-slate-400">PDF, PNG, JPG, or WEBP</p>
          {uploading && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div className="h-full bg-health-mint transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        {uploading && <span className="text-sm font-semibold text-muted dark:text-slate-400 sm:shrink-0">{progress}%</span>}
      </div>
    </label>
  );
}
