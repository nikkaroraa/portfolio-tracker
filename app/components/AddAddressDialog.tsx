import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SUPPORTED_CHAINS, Tag } from "../types";
import { TagSelector } from "./TagSelector";

interface AddAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    label: string;
    address: string;
    chain: string;
    network: string;
    description?: string;
    tags?: Tag[];
  }) => void;
}

export function AddAddressDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddAddressDialogProps) {
  const [formData, setFormData] = React.useState({
    label: "",
    address: "",
    chain: "",
    network: "mainnet",
    description: "",
  });
  const [selectedTags, setSelectedTags] = React.useState<Tag[]>([]);

  const handleSubmit = () => {
    if (formData.label && formData.address && formData.chain) {
      onSubmit({
        ...formData,
        description: formData.description || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      setFormData({ label: "", address: "", chain: "", network: "mainnet", description: "" });
      setSelectedTags([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="chain">Blockchain</Label>
            <Select
              value={formData.chain}
              onValueChange={(value) =>
                setFormData({ ...formData, chain: value, network: "mainnet" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blockchain" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAINS.map((chain) => (
                  <SelectItem key={chain.value} value={chain.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${chain.color}`} />
                      {chain.label} ({chain.symbol})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.chain === "ethereum" && (
            <div className="grid gap-2">
              <Label className="text-sm text-muted-foreground">
                All Ethereum-compatible chains will be tracked automatically
              </Label>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter wallet address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Main trading wallet, DeFi interactions, cold storage..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Address</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
