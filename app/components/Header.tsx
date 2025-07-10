import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Tag as TagIcon } from "lucide-react";
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
}

export function Header({
  onAddClick,
  selectedChain,
  onChainChange,
  selectedTag,
  onTagChange,
}: HeaderProps) {
  const { tags } = useTags();
  return (
    <div>
      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Chain Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">Chain:</span>
          <Select value={selectedChain} onValueChange={onChainChange}>
            <SelectTrigger className="w-[160px] cursor-pointer">
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
          <span className="text-sm text-muted-foreground hidden sm:inline">Tag:</span>
          <Select value={selectedTag} onValueChange={onTagChange}>
            <SelectTrigger className="w-[160px] cursor-pointer">
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

        {/* Action Button */}
        <Button onClick={onAddClick} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>
    </div>
  );
}
