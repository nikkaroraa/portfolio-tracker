import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Wallet, ChevronDown, ChevronRight } from "lucide-react";
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
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());

  // Group addresses by name
  const groupedAddresses = React.useMemo(() => {
    const groups = new Map<string, Address[]>();
    
    addresses.forEach(address => {
      const name = address.name || "Unnamed";
      if (!groups.has(name)) {
        groups.set(name, []);
      }
      groups.get(name)!.push(address);
    });

    return Array.from(groups.entries()).map(([name, addressList]) => ({
      name,
      addresses: addressList,
      count: addressList.length
    }));
  }, [addresses]);

  const toggleGroup = (name: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
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
    <div className="space-y-6">
      {groupedAddresses.map((group) => (
        <div key={group.name} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Group Header */}
          <div 
            className="bg-muted/30 px-4 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleGroup(group.name)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {collapsedGroups.has(group.name) ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <div className="font-semibold">{group.name}</div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="text-xs">
                  {group.count} {group.count === 1 ? 'address' : 'addresses'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Addresses in Group */}
          {!collapsedGroups.has(group.name) && (
            <div className="p-4">
              <div className="grid gap-4">
                {group.addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onBalanceUpdate={onBalanceUpdate}
                    onChainDataUpdate={onChainDataUpdate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
