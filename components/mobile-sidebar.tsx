"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react"; // Import the X icon
import Sidebar from "@/components/sidebar";

interface MobileSidebarProps {
  apiLimitCount: number;
}

const MobileSidebar = ({ apiLimitCount }: MobileSidebarProps) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div
          className="md:hidden cursor-pointer"
          role="button"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </div>
      </SheetTrigger>
      <SheetContent side="left" className="p-0" aria-label="Navigation">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        {/* Custom close button */}
        <SheetClose className="bg-white absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </SheetClose>

        <Sidebar apiLimitCount={apiLimitCount} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
