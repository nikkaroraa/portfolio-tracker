"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, ExternalLink } from "lucide-react";
import { isDemoMode } from "../lib/demoData";

interface DemoBannerProps {
  onLoadDemo?: () => void;
}

export function DemoBanner({ onLoadDemo }: DemoBannerProps) {
  if (!isDemoMode()) return null;

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Demo Mode
              </Badge>
              <span className="font-semibold">You&apos;re viewing a demo version</span>
            </div>
            <p>
              This demo shows popular crypto addresses with simulated data. 
              To track your own wallets, set up API keys in your environment.
            </p>
            <div className="flex gap-2 mt-3">
              {onLoadDemo && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onLoadDemo}
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
                >
                  Load Demo Addresses
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
              >
                <a 
                  href="https://github.com/your-repo/portfolio-tracker#setup" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  Setup Guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}