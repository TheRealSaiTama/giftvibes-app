"use client";

import * as React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PolicyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export const PolicyDrawer: React.FC<PolicyDrawerProps> = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  const sizeClasses = {
    small: 'max-h-[40vh] max-w-2xl',
    medium: 'max-h-[60vh] max-w-3xl', 
    large: 'max-h-[80vh] max-w-5xl'
  };

  const scrollHeightClasses = {
    small: 'h-[35vh]',
    medium: 'h-[55vh]',
    large: 'h-[70vh]'
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-white text-foreground">
        <div className={`mx-auto w-full ${sizeClasses[size]}`}>
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-2xl font-bold mb-2">{title}</DrawerTitle>
            <DrawerDescription>
              Last Updated: September 21, 2025
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <ScrollArea className={`${scrollHeightClasses[size]} pr-4`}>
              <div className="prose prose-sm max-w-none">
                {children}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
