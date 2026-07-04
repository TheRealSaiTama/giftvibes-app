"use client";
import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  baseText?: string;
  hoverText?: string;
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ children, className, baseText, hoverText, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        // Base layout
        "group relative w-auto cursor-pointer overflow-hidden rounded-full border-2 px-8 py-4 text-base font-bold transition-colors duration-300",
        // Midnight green scheme with invert on hover
        "border-[#124559] bg-[#124559] text-white hover:bg-white hover:text-[#124559]",
        className,
      )}
      {...props}
    >
      {/* White background overlay that fades in on hover to ensure contrast */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-white" />

      {/* Base content that slides out */}
      <div className="relative z-10 flex items-center gap-2 whitespace-nowrap">
        <div className="h-2 w-2 rounded-full bg-white transition-all duration-300 group-hover:bg-[#00000] group-hover:scale-[100.8]"></div>
        <span className="inline-block transition-transform duration-300 group-hover:translate-x-full group-hover:opacity-0">
          {baseText ?? children}
        </span>
      </div>

      {/* Reveal layer with arrow sliding in */}
      <div className="absolute inset-0 z-10 flex translate-x-full items-center justify-center gap-2 whitespace-nowrap text-[#124559] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span>{hoverText ?? children}</span>
        <ArrowRight />
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export default InteractiveHoverButton;


