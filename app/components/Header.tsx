import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, RefreshCw, Tag as TagIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_CHAINS } from "../types";
import { useTags } from "../hooks/useTags";

interface HeaderProps {
  onAddClick: () => void;
  selectedChain: string;
  onChainChange: (chain: string) => void;
  selectedTag: string;
  onTagChange: (tagId: string) => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
}

export function Header({
  onAddClick,
  selectedChain,
  onChainChange,
  selectedTag,
  onTagChange,
  onRefreshAll,
  isRefreshing,
}: HeaderProps) {
  const { tags } = useTags();
  return (
    <div className="mb-8 space-y-6">
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
      <div className="space-y-4">
        {/* Filters Row */}
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

          {/* Tag Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
              Filter by tag:
            </span>
            <Select value={selectedTag} onValueChange={onTagChange}>
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    All Tags
                  </div>
                </SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color }}
                        className="text-xs px-1 py-0"
                      >
                        {tag.name}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-center gap-3">
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
