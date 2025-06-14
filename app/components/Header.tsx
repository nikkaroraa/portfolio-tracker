import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_CHAINS } from "../types";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onAddClick: () => void;
  selectedChain: string;
  onChainChange: (chain: string) => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
}

export function Header({
  onAddClick,
  selectedChain,
  onChainChange,
  onRefreshAll,
  isRefreshing,
}: HeaderProps) {
  return (
    <div className="mb-8 space-y-6">
      {/* Theme Toggle - Top Right */}
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>

      {/* Title Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-3">
          <Wallet className="h-10 w-10" />
          Portfolio Tracker
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Multi-chain portfolio tracking + Secure access
        </p>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        {/* Chain Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
            Filter by chain:
          </span>
          <Select value={selectedChain} onValueChange={onChainChange}>
            <SelectTrigger className="w-[180px] cursor-pointer">
              <SelectValue placeholder="All Chains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">All Chains</SelectItem>
              {SUPPORTED_CHAINS.map((chain) => (
                <SelectItem key={chain.value} value={chain.value} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${chain.color}`} />
                    {chain.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={onRefreshAll} 
            size="lg" 
            variant="outline"
            className="cursor-pointer"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh All'}
          </Button>
          
          <Button onClick={onAddClick} size="lg" className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>
      </div>
    </div>
  );
}
