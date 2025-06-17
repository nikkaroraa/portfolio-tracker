import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  onReorder: (addresses: Address[]) => void;
}

export function AddressList({
  addresses,
  onEdit,
  onDelete,
  onAddClick,
  onBalanceUpdate,
  onChainDataUpdate,
  onReorder,
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

      onReorder(newAddresses);
    }
    setDraggedItem(null);
  };

  // Group addresses by label
  const groupedAddresses = React.useMemo(() => {
    const groups = new Map<string, Address[]>();
    
    addresses.forEach(address => {
      const label = address.label || "Unnamed";
      if (!groups.has(label)) {
        groups.set(label, []);
      }
      groups.get(label)!.push(address);
    });

    return Array.from(groups.entries()).map(([label, addressList]) => ({
      label,
      addresses: addressList,
      count: addressList.length
    }));
  }, [addresses]);

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
    <div className="space-y-6">
      {groupedAddresses.map((group) => (
        <div key={group.label} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Group Header */}
          <div className="bg-muted/30 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{group.label}</div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="text-xs">
                  {group.count} {group.count === 1 ? 'address' : 'addresses'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Addresses in Group */}
          <div className="p-4">
            <div className="grid gap-4">
              {group.addresses.map((address) => (
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
          </div>
        </div>
      ))}
    </div>
  );
}
