"use client";

import * as React from "react";
import { useState } from "react";
import { Address } from "./types";
import { Header } from "./components/Header";
import { AddressList } from "./components/AddressList";
import { AddAddressDialog } from "./components/AddAddressDialog";
import { EditAddressDialog } from "./components/EditAddressDialog";

export default function Page() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      label: "Main Bitcoin Wallet",
      address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      chain: "bitcoin",
      balance: 0.5,
      lastUpdated: new Date(),
    },
    {
      id: "2",
      label: "Ethereum Trading",
      address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
      chain: "ethereum",
      balance: 2.3,
      lastUpdated: new Date(),
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedChain, setSelectedChain] = useState("all");

  const filteredAddresses =
    selectedChain === "all"
      ? addresses
      : addresses.filter((addr) => addr.chain === selectedChain);

  const handleAddAddress = (data: {
    label: string;
    address: string;
    chain: string;
  }) => {
    const address: Address = {
      id: Date.now().toString(),
      label: data.label,
      address: data.address,
      chain: data.chain,
      lastUpdated: new Date(),
    };
    setAddresses([...addresses, address]);
    setIsAddDialogOpen(false);
  };

  const handleEditAddress = (address: Address) => {
    setAddresses(
      addresses.map((addr) => (addr.id === address.id ? address : addr))
    );
    setEditingAddress(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleBalanceUpdate = (
    id: string,
    balance: number,
    lastTransactions?: Address["lastTransactions"]
  ) => {
    setAddresses(
      addresses.map((addr) =>
        addr.id === id
          ? { ...addr, balance, lastUpdated: new Date(), lastTransactions }
          : addr
      )
    );
  };

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
