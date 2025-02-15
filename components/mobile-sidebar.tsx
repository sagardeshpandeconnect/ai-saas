"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";

const MobileSidebar = () => {
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
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
