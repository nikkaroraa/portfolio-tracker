import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";
import { Address, ChainData } from "../types";
import { AddressCard } from "./AddressCard";

interface AddressListProps {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
  onBalanceUpdate: (
    id: string,
    balance: number,
    lastTransactions?: Address["lastTransactions"],
    tokens?: Address["tokens"]
  ) => void;
  onChainDataUpdate: (id: string, chainData: ChainData[]) => void;
}

export function AddressList({
  addresses,
  onEdit,
  onDelete,
  onAddClick,
  onBalanceUpdate,
  onChainDataUpdate,
}: AddressListProps) {
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);

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

      // Note: You'll need to implement a way to update the addresses in the parent component
      // This could be through a callback prop like onAddressesReorder
    }
    setDraggedItem(null);
  };

  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No addresses added yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Start by adding your first cryptocurrency address to track
          </p>
          <Button onClick={onAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Address
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {addresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          onEdit={onEdit}
          onDelete={onDelete}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          isDragging={draggedItem === address.id}
          onBalanceUpdate={onBalanceUpdate}
          onChainDataUpdate={onChainDataUpdate}
        />
      ))}
    </div>
  );
}
