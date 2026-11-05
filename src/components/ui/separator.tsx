"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          "relative flex w-full shrink-0 border-border",
          orientation === "horizontal" ? "h-[px]" : "w-[px]",
          className
        )}
        aria-orientation={orientation}
        aria-hidden={decorative}
        {...props}
      />
    );
  }
);
Separator.displayName = "Separator";

export { Separator };
