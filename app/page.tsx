"use client";

import * as React from "react";
import { useState } from "react";
import { Address, ChainData, Tag } from "./types";
import { useAddresses } from "./hooks/useAddresses";
import { TIMEOUTS } from "./lib/constants";
import { Header } from "./components/Header";
import { AddressList } from "./components/AddressList";
import { AddAddressDialog } from "./components/AddAddressDialog";
import { EditAddressDialog } from "./components/EditAddressDialog";
import { PasswordGate } from "./components/PasswordGate";
import { LoadingScreen } from "./components/LoadingScreen";

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

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

  const handleBalanceUpdate = async (
    id: string,
    balance: number,
    lastTransactions?: Address["lastTransactions"],
    tokens?: Address["tokens"]
  ) => {
    try {
      await updateAddressBalance(id, balance, tokens, lastTransactions);
    } catch (err) {
      console.error('Failed to update balance:', err);
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
    setIsRefreshingAll(true);
    
    // Dispatch a custom event that AddressCard components can listen to
    const refreshEvent = new CustomEvent('refreshAllAddresses');
    window.dispatchEvent(refreshEvent);
    
    // Wait a bit for all the refreshes to complete
    // This is a simple approach - in a real app you might want more sophisticated coordination
    setTimeout(() => {
      setIsRefreshingAll(false);
    }, TIMEOUTS.REFRESH_DELAY);
  };

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

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
    <div className="container mx-auto p-6 max-w-4xl">
      <Header
        onAddClick={() => setIsAddDialogOpen(true)}
        selectedChain={selectedChain}
        onChainChange={setSelectedChain}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        onRefreshAll={handleRefreshAll}
        isRefreshing={isRefreshingAll}
      />

      <AddressList
        addresses={filteredAddresses}
        onEdit={(addr) => {
          setEditingAddress(addr);
          setIsEditDialogOpen(true);
        }}
        onDelete={handleDeleteAddress}
        onAddClick={() => setIsAddDialogOpen(true)}
        onBalanceUpdate={handleBalanceUpdate}
        onChainDataUpdate={handleChainDataUpdate}
      />

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
