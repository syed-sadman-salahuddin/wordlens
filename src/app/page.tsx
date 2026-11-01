import UploadCard from "@/components/UploadCard";
import ScanCard from "@/components/ScanCard";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Find the words that matter
        </h1>
        <p className="mt-4 text-lg text-slate-500">
          Highlight rare words with meanings and synonyms.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <UploadCard />
        <ScanCard />
      </div>
    </div>
  );
}