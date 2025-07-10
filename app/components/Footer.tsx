import * as React from "react";
import { Github, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Built with ❤️ for the crypto community</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/nikkaroraa/portfolio-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Github className="h-4 w-4" />
              <span>Open Source</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            
            <div className="text-sm text-muted-foreground">
              <span>Self-hosted • Privacy-first • No tracking</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center">
            Multi-chain portfolio tracker for Bitcoin, Ethereum, and Layer 2 networks
          </p>
        </div>
      </div>
    </footer>
  );
}