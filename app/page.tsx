"use client";

import * as React from "react";
import { useState } from "react";
import { Address, ChainData, Tag } from "./types";
import { useAddresses } from "./hooks/useAddresses";
import { TIMEOUTS } from "./lib/constants";
import { Header } from "./components/Header";
import { AddAddressDialog } from "./components/AddAddressDialog";
import { EditAddressDialog } from "./components/EditAddressDialog";
import { LoadingScreen } from "./components/LoadingScreen";
import { PortfolioSummary } from "./components/PortfolioSummary";
import { RateLimitNotification } from "./components/RateLimitNotification";
import { DemoBanner } from "./components/DemoBanner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useFetchingQueue } from "./hooks/useFetchingQueue";
import { getDemoAddresses } from "./lib/demoData";

export default function Page() {
  const hasAlchemyKey = !!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  
  const {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    updateAddressBalance,
  } = useAddresses();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedChain, setSelectedChain] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  const [lastPositionUpdate, setLastPositionUpdate] = useState<Date | null>(null);
  const [refreshPrices, setRefreshPrices] = useState<(() => Promise<void>) | null>(null);
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  const [isFetchingPositions, setIsFetchingPositions] = useState(false);
  
  const {
    fetchingAddresses
  } = useFetchingQueue();
  

  const filteredAddresses = addresses.filter((addr) => {
    // Filter by chain
    const chainMatch = selectedChain === "all" || addr.chain === selectedChain;
    
    // Filter by tag
    const tagMatch = selectedTag === "all" || 
      (addr.tags && addr.tags.some(tag => tag.id === selectedTag));
    
    return chainMatch && tagMatch;
  });

  const handleAddAddress = async (data: {
    name: string;
    address: string;
    chain: string;
    network: string;
    description?: string;
    tags?: Tag[];
  }) => {
    try {
      await addAddress({
        name: data.name,
        address: data.address,
        chain: data.chain,
        network: data.network,
        description: data.description,
        tags: data.tags,
        lastUpdated: new Date(),
        balance: data.chain === "ethereum" ? 0 : undefined,
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Failed to add address:', err);
    }
  };

  const handleEditAddress = async (address: Address) => {
    try {
      await updateAddress(address.id, {
        name: address.name,
        address: address.address,
        chain: address.chain,
        network: address.network,
        description: address.description,
        tags: address.tags,
      });
      setEditingAddress(null);
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error('Failed to update address:', err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddress(id);
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleChainDataUpdate = async (id: string, chainData: ChainData[]) => {
    try {
      await updateAddressBalance(id, 0, undefined, undefined, chainData);
    } catch (err) {
      console.error('Failed to update chain data:', err);
    }
  };

  const handleRefreshAll = async () => {
    setIsFetchingPositions(true);
    
    // Dispatch a custom event that AddressCard components can listen to
    const refreshEvent = new CustomEvent('refreshAllAddresses');
    window.dispatchEvent(refreshEvent);
    
    // Set the last updated time
    setLastPositionUpdate(new Date());
    
    // Wait a bit for all the refreshes to complete
    // This is a simple approach - in a real app you might want more sophisticated coordination
    setTimeout(() => {
      setIsFetchingPositions(false);
      
    }, TIMEOUTS.REFRESH_DELAY);
  };

  const handleRefreshPrices = async () => {
    if (typeof refreshPrices === 'function') {
      await refreshPrices();
    } else if (window.refreshPricesDirectly) {
      await window.refreshPricesDirectly();
    }
  };

  const handleLoadDemoAddresses = () => {
    const demoAddresses = getDemoAddresses();
    demoAddresses.forEach(addr => {
      addAddress({
        name: addr.name,
        address: addr.address,
        chain: addr.chain,
        network: addr.network,
        description: addr.description,
        tags: addr.tags,
        lastUpdated: addr.lastUpdated,
        balance: addr.balance,
        tokens: addr.tokens,
        lastTransactions: addr.lastTransactions,
        chainData: addr.chainData
      });
    });
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
      <div className="mb-8">
        {/* Main Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Portfolio Tracker</h1>
          <p className="text-muted-foreground">Multi-chain portfolio tracking</p>
        </div>
        
        <DemoBanner onLoadDemo={handleLoadDemoAddresses} />
        
        <div className="space-y-6">
          <Header
            onAddClick={() => setIsAddDialogOpen(true)}
            selectedChain={selectedChain}
            onChainChange={setSelectedChain}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
          />
          
          {!hasAlchemyKey && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Setup Required</AlertTitle>
              <AlertDescription>
                Ethereum and Solana balance fetching requires an Alchemy API key. 
                Please add your NEXT_PUBLIC_ALCHEMY_API_KEY to your environment variables. 
                Bitcoin addresses will work without this key.
              </AlertDescription>
            </Alert>
          )}

          <RateLimitNotification 
            addresses={fetchingAddresses}
          />

          {addresses.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No Wallets Added</h2>
              <p className="text-muted-foreground mb-4">
                Add some wallet addresses to see your portfolio dashboard
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)} 
                className="cursor-pointer"
              >
                Add Your First Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Portfolio Summary */}
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshAll}
                      disabled={isFetchingPositions}
                      className="cursor-pointer"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isFetchingPositions ? 'animate-spin' : ''}`} />
                      {isFetchingPositions ? 'Refreshing...' : 'Refresh Positions'}
                    </Button>
                    {lastPositionUpdate && (
                      <span className="text-xs text-muted-foreground">
                        Last updated: {lastPositionUpdate.toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshPrices}
                      disabled={isFetchingPrices || !refreshPrices}
                      className="cursor-pointer"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isFetchingPrices ? 'animate-spin' : ''}`} />
                      {isFetchingPrices ? 'Updating...' : 'Refresh Prices'}
                    </Button>
                    {lastPriceUpdate && (
                      <span className="text-xs text-muted-foreground">
                        Last updated: {lastPriceUpdate.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <PortfolioSummary 
                  addresses={filteredAddresses} 
                  onPriceUpdate={setLastPriceUpdate}
                  onRefreshCallback={(fn) => {
                    setRefreshPrices(() => fn);
                  }}
                  onFetchingChange={setIsFetchingPrices}
                  onDirectRefresh={() => {}}
                  onAddressUpdate={handleChainDataUpdate}
                  onEdit={(addr) => {
                    setEditingAddress(addr);
                    setIsEditDialogOpen(true);
                  }}
                  onDelete={handleDeleteAddress}
                  onAddClick={() => setIsAddDialogOpen(true)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <AddAddressDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddAddress}
      />

      <EditAddressDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        address={editingAddress}
        onSubmit={handleEditAddress}
      />
    </div>
  );
}
