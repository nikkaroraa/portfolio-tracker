"use client";

import { useEffect, useState } from "react";
import { Wallet, Link, Zap } from "lucide-react";

export function LoadingScreen() {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const blockInterval = setInterval(() => {
      setCurrentBlock(prev => prev + 1);
    }, 150);

    const phaseInterval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 800);

    return () => {
      clearInterval(blockInterval);
      clearInterval(phaseInterval);
    };
  }, []);

  const loadingTexts = [
    "Connecting to networks",
    "Syncing blockchain data",
    "Loading portfolio"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Wallet className="h-16 w-16 text-primary animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Zap className="h-6 w-6 text-yellow-500 animate-bounce" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
        </div>

        {/* Blockchain Animation */}
        <div className="space-y-6">
          {/* Block Chain Visualization */}
          <div className="flex justify-center items-center space-x-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="flex items-center">
                <div 
                  className={`w-4 h-4 rounded border-2 transition-all duration-300 ${
                    index <= (currentBlock % 5) 
                      ? 'bg-primary border-primary shadow-lg shadow-primary/50' 
                      : 'border-muted-foreground/30'
                  }`}
                />
                {index < 4 && (
                  <Link 
                    className={`h-3 w-3 mx-1 transition-colors duration-300 ${
                      index < (currentBlock % 5) 
                        ? 'text-primary' 
                        : 'text-muted-foreground/30'
                    }`} 
                  />
                )}
              </div>
            ))}
          </div>

          {/* Loading Text */}
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {loadingTexts[animationPhase]}
              <span className="inline-flex ml-1">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className={`transition-opacity duration-500 ${
                      dot <= animationPhase ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    .
                  </span>
                ))}
              </span>
            </p>
            
            {/* Block Counter */}
            <div className="text-sm text-muted-foreground font-mono">
              Block #{currentBlock.toString().padStart(6, '0')}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300 animate-pulse"
              style={{ 
                width: `${((currentBlock % 100) + 1)}%`,
                minWidth: '10%'
              }}
            />
          </div>
        </div>

        {/* Network Indicators */}
        <div className="flex justify-center space-x-4 text-xs">
          {['Bitcoin', 'Ethereum', 'Solana'].map((network, index) => (
            <div 
              key={network}
              className={`flex items-center space-x-1 transition-all duration-500 ${
                index <= animationPhase ? 'opacity-100 text-green-500' : 'opacity-40'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                index <= animationPhase ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
              }`} />
              <span>{network}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}