import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wallet, BarChart3 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation() {
  const pathname = usePathname();

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
          <Link href="/">
            <Button 
              variant={pathname === "/" ? "default" : "ghost"} 
              size="sm"
              className="cursor-pointer"
            >
              Wallets
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button 
              variant={pathname === "/dashboard" ? "default" : "ghost"} 
              size="sm"
              className="cursor-pointer"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}