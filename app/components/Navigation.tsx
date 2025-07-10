"use client";

import * as React from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation() {

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
          <Wallet className="h-6 w-6" />
          Portfolio Tracker
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}