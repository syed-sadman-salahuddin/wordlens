import Link from "next/link";
import { ArrowUpRight, Camera, ImagePlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ScanCard() {
  return (
    <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/90 shadow-lg shadow-slate-900/[0.03]">
      <CardHeader className="pb-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Camera className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg">Scan printed pages</CardTitle>
            <CardDescription>Use your camera or choose images to get started.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Link
          href="/scan"
          className="group flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-background/70 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
            <ImagePlus className="h-7 w-7" />
          </div>
          <div className="text-center">
            <p className="font-medium">Open page scanner</p>
            <p className="mt-1 text-sm text-muted-foreground">Camera capture or multiple images</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Start scanning <ArrowUpRight className="h-4 w-4" />
          </span>
        </Link>
      </CardContent>
    </Card>
  );
}
