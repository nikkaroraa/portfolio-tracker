import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { SUPPORTED_CHAINS, SUPPORTED_ETHEREUM_NETWORKS } from "../types";

interface AddAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    label: string;
    address: string;
    chain: string;
    network: string;
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
  });

  const handleSubmit = () => {
    if (formData.label && formData.address && formData.chain) {
      onSubmit(formData);
      setFormData({ label: "", address: "", chain: "", network: "mainnet" });
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
              <Label htmlFor="network">Ethereum Network</Label>
              <Select
                value={formData.network}
                onValueChange={(value) =>
                  setFormData({ ...formData, network: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_ETHEREUM_NETWORKS.map((net) => (
                    <SelectItem key={net.value} value={net.value}>
                      {net.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
