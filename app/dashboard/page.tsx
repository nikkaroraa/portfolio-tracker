"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAddresses } from "../hooks/useAddresses";
import { PortfolioSummary } from "../components/PortfolioSummary";
import { LoadingScreen } from "../components/LoadingScreen";

export default function DashboardPage() {
  const { addresses, loading, error } = useAddresses();
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);

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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="cursor-pointer">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Wallets
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive overview of your crypto portfolio
              </p>
            </div>
          </div>
          {lastPriceUpdate && (
            <div className="text-right text-sm text-muted-foreground">
              <p>Prices last updated:</p>
              <p>{lastPriceUpdate.toLocaleTimeString()}</p>
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
        />
      )}
    </div>
  );
}