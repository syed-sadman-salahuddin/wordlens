import { BookOpenCheck, ScanText, Sparkles } from "lucide-react";
import UploadCard from "@/components/UploadCard";
import ScanCard from "@/components/ScanCard";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:pb-24 sm:pt-20">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-3.5 py-1.5 text-sm font-medium text-primary shadow-sm">
          <Sparkles className="h-4 w-4" />
          A clearer way to read
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
          Find the words
          <span className="block text-primary">that matter.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
          Turn any document into a richer reading experience. Discover uncommon
          words, explore their meanings, and keep learning as you go.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:mt-16 md:grid-cols-2">
        <UploadCard />
        <ScanCard />
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <BookOpenCheck className="h-4 w-4 text-primary" />
          Definitions and synonyms
        </span>
        <span className="inline-flex items-center gap-2">
          <ScanText className="h-4 w-4 text-primary" />
          Documents and page scans
        </span>
      </div>
    </div>
  );
}