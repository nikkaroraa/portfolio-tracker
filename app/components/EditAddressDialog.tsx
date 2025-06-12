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
import {
  Address,
  SUPPORTED_CHAINS,
} from "../types";

interface EditAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: Address | null;
  onSubmit: (address: Address) => void;
}

export function EditAddressDialog({
  open,
  onOpenChange,
  address,
  onSubmit,
}: EditAddressDialogProps) {
  const [formData, setFormData] = React.useState<Address | null>(null);

  React.useEffect(() => {
    if (address) {
      setFormData(address);
    }
  }, [address]);

  const handleSubmit = () => {
    if (formData) {
      onSubmit(formData);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Address</DialogTitle>
          <DialogDescription>
            Update the details of your cryptocurrency address
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-label">Label</Label>
            <Input
              id="edit-label"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-chain">Blockchain</Label>
            <Select
              value={formData.chain}
              onValueChange={(value) =>
                setFormData({ ...formData, chain: value, network: "mainnet" })
              }
            >
              <SelectTrigger>
                <SelectValue />
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
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
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
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
