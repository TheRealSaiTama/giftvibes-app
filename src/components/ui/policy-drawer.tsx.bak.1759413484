"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PolicyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export const PolicyDrawer: React.FC<PolicyDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
}) => {
  const widthClasses: Record<Required<PolicyDrawerProps>["size"], string> = {
    small: "max-w-2xl",
    medium: "max-w-4xl",
    large: "max-w-6xl",
  };

  const scrollHeightClasses: Record<Required<PolicyDrawerProps>["size"], string> = {
    small: "max-h-[52vh] lg:max-h-[56vh]",
    medium: "max-h-[60vh] lg:max-h-[65vh]",
    large: "max-h-[68vh] lg:max-h-[72vh]",
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-white text-foreground">
        <div
          className={`mx-auto w-full ${widthClasses[size]} rounded-2xl border border-gray-100 shadow-2xl bg-white`}
        >
          <div className="relative flex items-center justify-between border-b border-gray-200 px-6 py-5">
            <div>
              <DrawerTitle className="text-xl md:text-2xl font-semibold text-gray-900">
                {title}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-gray-500 mt-1">
                Last Updated: September 21, 2025
              </DrawerDescription>
            </div>
            <DrawerClose
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </DrawerClose>
          </div>

          <ScrollArea
            className={`w-full px-6 pt-6 pb-4 overflow-y-auto ${scrollHeightClasses[size]}`}
          >
            <div className="space-y-9 pb-8">
              <div className="prose prose-sm max-w-none text-gray-600">
                {children}
              </div>
              <div className="flex flex-col items-center gap-1.5 text-gray-400 text-[11px] uppercase tracking-[0.4em] pb-4">
                <span className="h-px w-12 bg-gray-300" />
                <span>End</span>
                <span className="h-px w-8 bg-gray-200" />
              </div>
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
