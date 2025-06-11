import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_CHAINS } from "../types";

interface HeaderProps {
  onAddClick: () => void;
  selectedChain: string;
  onChainChange: (chain: string) => void;
}

export function Header({
  onAddClick,
  selectedChain,
  onChainChange,
}: HeaderProps) {
  return (
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
      <div className="flex items-center gap-4">
        <Select value={selectedChain} onValueChange={onChainChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Chains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chains</SelectItem>
            {SUPPORTED_CHAINS.map((chain) => (
              <SelectItem key={chain.value} value={chain.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${chain.color}`} />
                  {chain.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={onAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>
    </div>
  );
}
