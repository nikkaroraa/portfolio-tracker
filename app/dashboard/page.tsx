"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useAddresses } from "../hooks/useAddresses";
import { PortfolioSummary } from "../components/PortfolioSummary";
import { LoadingScreen } from "../components/LoadingScreen";

export default function DashboardPage() {
  const { addresses, loading, error } = useAddresses();
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  const [lastPositionUpdate, setLastPositionUpdate] = useState<Date | null>(null);
  const [refreshPrices, setRefreshPrices] = useState<(() => Promise<void>) | null>(null);
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  const [isFetchingPositions, setIsFetchingPositions] = useState(false);


  const handleRefreshPositions = async () => {
    setIsFetchingPositions(true);
    
    // Dispatch the same custom event that the main page uses
    const refreshEvent = new CustomEvent('refreshAllAddresses');
    window.dispatchEvent(refreshEvent);
    
    // Set the last updated time
    setLastPositionUpdate(new Date());
    
    // Wait for refreshes to complete
    setTimeout(() => {
      setIsFetchingPositions(false);
    }, 3000);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wallets
            </Button>
          </Link>
        </div>
        
        {/* Title Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3">Portfolio Dashboard</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Comprehensive overview of your crypto portfolio
          </p>
          
          {/* Controls */}
          {addresses.length > 0 && (
            <div className="flex flex-col items-center gap-3 mt-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshPositions}
                  disabled={isFetchingPositions}
                  className="cursor-pointer"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isFetchingPositions ? 'animate-spin' : ''}`} />
                  {isFetchingPositions ? 'Refreshing...' : 'Refresh Positions'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (typeof refreshPrices === 'function') {
                      refreshPrices();
                    } else if ((window as any).refreshPricesDirectly) {
                      (window as any).refreshPricesDirectly();
                    }
                  }}
                  disabled={isFetchingPrices || !refreshPrices}
                  className="cursor-pointer"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isFetchingPrices ? 'animate-spin' : ''}`} />
                  {isFetchingPrices ? 'Updating...' : 'Refresh Prices'}
                </Button>
              </div>
              <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                {lastPositionUpdate && (
                  <span>
                    Positions last updated: {lastPositionUpdate.toLocaleTimeString()}
                  </span>
                )}
                {lastPriceUpdate && (
                  <span>
                    Prices last updated: {lastPriceUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Content */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">No Wallets Added</h2>
            <p className="text-muted-foreground mb-4">
              Add some wallet addresses to see your portfolio dashboard
            </p>
            <Link href="/">
              <Button className="cursor-pointer">
                Add Your First Wallet
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <PortfolioSummary 
          addresses={addresses} 
          onPriceUpdate={setLastPriceUpdate}
          onRefreshCallback={(fn) => {
            setRefreshPrices(() => fn);
          }}
          onFetchingChange={setIsFetchingPrices}
          onDirectRefresh={() => {}}
        />
      )}
    </div>
  );
}