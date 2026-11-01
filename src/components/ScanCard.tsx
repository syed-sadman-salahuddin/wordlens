import { Camera } from "lucide-react";

export default function ScanCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Camera className="h-5 w-5 text-indigo-600" />
        Scan
        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
          Soon
        </span>
      </h2>
      <div className="flex h-72 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
        <Camera className="h-10 w-10" />
        <p className="text-sm">Camera or image</p>
      </div>
    </div>
  );
}