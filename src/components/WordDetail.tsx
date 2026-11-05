"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchDefinition } from "@/lib/define";
import DefinitionView from "@/components/DefinitionView";
import type { Definition } from "@/lib/types";

export default function WordDetail({ word }: { word: string }) {
  const [def, setDef] = useState<Definition | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    fetchDefinition(word).then((d) => {
      if (active) setDef(d);
    });
    return () => {
      active = false;
    };
  }, [word]);

  if (def === undefined) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }
  if (def === null) {
    return <p className="text-sm text-muted-foreground">No definition found</p>;
  }
  return <DefinitionView {...def} />;
}
