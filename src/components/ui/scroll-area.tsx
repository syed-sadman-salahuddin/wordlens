"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";
import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative w-full", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="w-full h-full rounded-md border-border" />
    <ScrollAreaPrimitive.Scrollbar className="hidden">
      <ScrollAreaPrimitive.Thumb />
    </ScrollAreaPrimitive.Scrollbar>
    {children}
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export { ScrollArea };
