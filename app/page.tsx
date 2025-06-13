"use client";

import * as React from "react";
import { useState } from "react";
import { Address, ChainData } from "./types";
import { useAddresses } from "./hooks/useAddresses";
import { Header } from "./components/Header";
import { AddressList } from "./components/AddressList";
import { AddAddressDialog } from "./components/AddAddressDialog";
import { EditAddressDialog } from "./components/EditAddressDialog";

export default function Page() {
  const {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    updateAddressBalance,
    reorderAddresses,
  } = useAddresses();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedChain, setSelectedChain] = useState("all");

  const filteredAddresses =
    selectedChain === "all"
      ? addresses
      : addresses.filter((addr) => addr.chain === selectedChain);

  const handleAddAddress = async (data: {
    label: string;
    address: string;
    chain: string;
  }) => {
    try {
      await addAddress({
        label: data.label,
        address: data.address,
        chain: data.chain,
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
        label: address.label,
        address: address.address,
        chain: address.chain,
        network: address.network,
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

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading addresses...</div>
        </div>
      </div>
    );
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
        onReorder={reorderAddresses}
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
