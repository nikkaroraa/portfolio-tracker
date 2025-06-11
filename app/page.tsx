"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Edit2,
  GripVertical,
  Plus,
  Wallet,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

interface Address {
  id: string;
  label: string;
  address: string;
  chain: string;
  balance?: number;
  lastUpdated?: Date;
  lastTransactions?: Array<{
    hash: string;
    timestamp: number;
    value: number;
    type: "sent" | "received";
  }>;
}

interface TransactionVout {
  value: number;
  scriptpubkey_address: string;
}

interface TransactionVin {
  prevout: {
    value: number;
    scriptpubkey_address: string;
  };
}

interface Transaction {
  txid: string;
  status: {
    block_time: number;
  };
  vout: TransactionVout[];
  vin: TransactionVin[];
}

const SUPPORTED_CHAINS = [
  { value: "bitcoin", label: "Bitcoin", symbol: "BTC", color: "bg-orange-500" },
  { value: "ethereum", label: "Ethereum", symbol: "ETH", color: "bg-blue-500" },
  { value: "solana", label: "Solana", symbol: "SOL", color: "bg-purple-500" },
  { value: "zcash", label: "Zcash", symbol: "ZEC", color: "bg-yellow-500" },
];

function getChainInfo(chainValue: string) {
  return SUPPORTED_CHAINS.find((chain) => chain.value === chainValue);
}

function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// Add this new function to fetch Bitcoin balance and transactions
async function fetchBitcoinBalance(address: string) {
  const response = await fetch(`https://mempool.space/api/address/${address}`);
  if (!response.ok) {
    throw new Error("Failed to fetch balance");
  }
  const data = await response.json();

  // Get the recent transactions
  const transactionsResponse = await fetch(
    `https://mempool.space/api/address/${address}/txs`
  );
  if (!transactionsResponse.ok) {
    throw new Error("Failed to fetch transactions");
  }
  const transactions = (await transactionsResponse.json()) as Transaction[];

  // Process the last 5 transactions
  const recentTransactions = transactions.slice(0, 5).map((tx) => {
    // Check if our address is in inputs (sent) or outputs (received)
    const isInInputs = tx.vin.some(
      (input) => input.prevout.scriptpubkey_address === address
    );
    const isInOutputs = tx.vout.some(
      (output) => output.scriptpubkey_address === address
    );

    // Calculate the value for this address
    let value = 0;
    if (isInInputs) {
      // If sent, sum up all outputs that aren't to our address
      value = tx.vout
        .filter((output) => output.scriptpubkey_address !== address)
        .reduce((sum, output) => sum + output.value, 0);
    } else if (isInOutputs) {
      // If received, sum up all outputs to our address
      value = tx.vout
        .filter((output) => output.scriptpubkey_address === address)
        .reduce((sum, output) => sum + output.value, 0);
    }

    const type: "sent" | "received" = isInInputs ? "sent" : "received";

    return {
      hash: tx.txid,
      timestamp: tx.status.block_time,
      value: value / 100000000, // Convert satoshis to BTC
      type,
    };
  });

  return {
    balance: data.chain_stats.funded_txo_sum / 100000000,
    lastTransactions: recentTransactions,
  };
}

// Custom hook for Bitcoin balance
function useBitcoinBalance(address: string) {
  return useQuery({
    queryKey: ["bitcoinBalance", address],
    queryFn: () => fetchBitcoinBalance(address),
    enabled: false, // Don't fetch automatically
  });
}

// Address Card Component
function AddressCard({
  address,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  onBalanceUpdate,
}: {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  isDragging: boolean;
  onBalanceUpdate: (
    id: string,
    balance: number,
    lastTransactions?: Address["lastTransactions"]
  ) => void;
}) {
  const chainInfo = getChainInfo(address.chain);
  const { refetch: refetchBalance, isFetching } = useBitcoinBalance(
    address.address
  );

  const handleRefresh = async () => {
    try {
      const { data } = await refetchBalance();
      if (data) {
        onBalanceUpdate(address.id, data.balance, data.lastTransactions);
      }
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
  };

  return (
    <Card
      className={`transition-all duration-200 ${
        isDragging ? "opacity-50" : ""
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, address.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, address.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <div className="flex items-center gap-2">
              {chainInfo && (
                <div className={`w-3 h-3 rounded-full ${chainInfo.color}`} />
              )}
              <CardTitle className="text-lg">{address.label}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {chainInfo?.symbol || address.chain.toUpperCase()}
            </Badge>
            {address.chain === "bitcoin" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => onEdit(address)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(address.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Address</Label>
            <p className="font-mono text-sm break-all bg-muted p-2 rounded">
              {address.address}
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label className="text-sm text-muted-foreground">Balance</Label>
                <p className="font-semibold">
                  {address.balance !== undefined
                    ? `${address.balance} ${
                        chainInfo?.symbol || address.chain.toUpperCase()
                      }`
                    : "Not fetched yet"}
                </p>
              </div>
              {address.lastUpdated && (
                <div className="text-right">
                  <Label className="text-sm text-muted-foreground">
                    Last Updated
                  </Label>
                  <p className="text-sm">
                    {formatDate(new Date(address.lastUpdated))}
                  </p>
                </div>
              )}
            </div>
            {address.lastTransactions &&
              address.lastTransactions.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Recent Transactions
                  </Label>
                  <div className="overflow-x-auto rounded border bg-white dark:bg-card">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Amount
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Hash
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {address.lastTransactions.map((tx) => {
                          const isReceived = tx.type === "received";
                          return (
                            <tr
                              key={tx.hash}
                              className="border-b last:border-0"
                            >
                              <td className="px-4 py-2 whitespace-nowrap">
                                {formatDate(new Date(tx.timestamp * 1000))}
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    isReceived
                                      ? "bg-green-50 text-green-700 border border-green-200"
                                      : "bg-red-50 text-red-700 border border-red-200"
                                  }`}
                                >
                                  {isReceived ? (
                                    <span className="inline-block rotate-45">
                                      ↗
                                    </span>
                                  ) : (
                                    <span className="inline-block -rotate-45">
                                      ↙
                                    </span>
                                  )}
                                  {isReceived ? "Received" : "Sent"}
                                </span>
                              </td>
                              <td
                                className={`px-4 py-2 font-mono ${
                                  isReceived ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {isReceived ? "+" : "-"}
                                {tx.value.toFixed(8)} BTC
                              </td>
                              <td className="px-4 py-2">
                                <a
                                  href={`https://mempool.space/tx/${tx.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-muted px-2 py-1 rounded font-mono text-xs hover:underline"
                                >
                                  {tx.hash.slice(0, 12)}...
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

  const [newAddress, setNewAddress] = useState({
    label: "",
    address: "",
    chain: "",
  });

  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleAddAddress = () => {
    if (newAddress.label && newAddress.address && newAddress.chain) {
      const address: Address = {
        id: Date.now().toString(),
        label: newAddress.label,
        address: newAddress.address,
        chain: newAddress.chain,
        lastUpdated: new Date(),
      };
      setAddresses([...addresses, address]);
      setNewAddress({ label: "", address: "", chain: "" });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditAddress = () => {
    if (editingAddress) {
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddress.id ? editingAddress : addr
        )
      );
      setEditingAddress(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (draggedItem && draggedItem !== targetId) {
      const draggedIndex = addresses.findIndex(
        (addr) => addr.id === draggedItem
      );
      const targetIndex = addresses.findIndex((addr) => addr.id === targetId);

      const newAddresses = [...addresses];
      const [draggedAddress] = newAddresses.splice(draggedIndex, 1);
      newAddresses.splice(targetIndex, 0, draggedAddress);

      setAddresses(newAddresses);
    }
    setDraggedItem(null);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-8 w-8" />
            Crypto Address Tracker
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your cryptocurrency addresses across multiple blockchains
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
              <DialogDescription>
                Add a cryptocurrency address to track its balance
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  placeholder="e.g., Main Wallet, Trading Account"
                  value={newAddress.label}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, label: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="chain">Blockchain</Label>
                <Select
                  value={newAddress.chain}
                  onValueChange={(value) =>
                    setNewAddress({ ...newAddress, chain: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blockchain" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CHAINS.map((chain) => (
                      <SelectItem key={chain.value} value={chain.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${chain.color}`}
                          />
                          {chain.label} ({chain.symbol})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter wallet address"
                  value={newAddress.address}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, address: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddAddress}>Add Address</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No addresses added yet
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Start by adding your first cryptocurrency address to track
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={(addr) => {
                setEditingAddress(addr);
                setIsEditDialogOpen(true);
              }}
              onDelete={handleDeleteAddress}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedItem === address.id}
              onBalanceUpdate={handleBalanceUpdate}
            />
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>
              Update the details of your cryptocurrency address
            </DialogDescription>
          </DialogHeader>
          {editingAddress && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-label">Label</Label>
                <Input
                  id="edit-label"
                  value={editingAddress.label}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      label: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-chain">Blockchain</Label>
                <Select
                  value={editingAddress.chain}
                  onValueChange={(value) =>
                    setEditingAddress({ ...editingAddress, chain: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CHAINS.map((chain) => (
                      <SelectItem key={chain.value} value={chain.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${chain.color}`}
                          />
                          {chain.label} ({chain.symbol})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editingAddress.address}
                  onChange={(e) =>
                    setEditingAddress({
                      ...editingAddress,
                      address: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditAddress}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
