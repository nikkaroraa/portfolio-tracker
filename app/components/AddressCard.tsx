import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, GripVertical, RefreshCw } from "lucide-react";
import { Address, ChainInfo, SUPPORTED_CHAINS } from "../types";
import { useBitcoinBalance } from "../hooks/useBitcoinBalance";

function getChainInfo(chainValue: string): ChainInfo | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.value === chainValue);
}

function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  isDragging: boolean;
  onBalanceUpdate: (
    id: string,
    balance: number,
    lastTransactions?: Address["lastTransactions"]
  ) => void;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  onBalanceUpdate,
}: AddressCardProps) {
  const chainInfo = getChainInfo(address.chain);
  const { refetch: refetchBalance, isFetching } = useBitcoinBalance(
    address.address
  );

  const handleRefresh = async () => {
    try {
      const { data } = await refetchBalance();
      if (data) {
        onBalanceUpdate(address.id, data.balance, data.lastTransactions);
      }
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
  };

  return (
    <Card
      className={`transition-all duration-200 ${
        isDragging ? "opacity-50" : ""
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, address.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, address.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <div className="flex items-center gap-2">
              {chainInfo && (
                <div className={`w-3 h-3 rounded-full ${chainInfo.color}`} />
              )}
              <CardTitle className="text-lg">{address.label}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {chainInfo?.symbol || address.chain.toUpperCase()}
            </Badge>
            {address.chain === "bitcoin" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => onEdit(address)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(address.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Address</Label>
            <p className="font-mono text-sm break-all bg-muted p-2 rounded">
              {address.address}
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label className="text-sm text-muted-foreground">Balance</Label>
                <p className="font-semibold">
                  {address.balance !== undefined
                    ? `${address.balance} ${
                        chainInfo?.symbol || address.chain.toUpperCase()
                      }`
                    : "Not fetched yet"}
                </p>
              </div>
              {address.lastUpdated && (
                <div className="text-right">
                  <Label className="text-sm text-muted-foreground">
                    Last Updated
                  </Label>
                  <p className="text-sm">
                    {formatDate(new Date(address.lastUpdated))}
                  </p>
                </div>
              )}
            </div>
            {address.lastTransactions &&
              address.lastTransactions.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Recent Transactions
                  </Label>
                  <div className="overflow-x-auto rounded border bg-white dark:bg-card">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Amount
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                            Hash
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {address.lastTransactions.map((tx) => {
                          const isReceived = tx.type === "received";
                          return (
                            <tr
                              key={tx.hash}
                              className="border-b last:border-0"
                            >
                              <td className="px-4 py-2 whitespace-nowrap">
                                {formatDate(new Date(tx.timestamp * 1000))}
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    isReceived
                                      ? "bg-green-50 text-green-700 border border-green-200"
                                      : "bg-red-50 text-red-700 border border-red-200"
                                  }`}
                                >
                                  {isReceived ? (
                                    <span className="inline-block rotate-45">
                                      ↗
                                    </span>
                                  ) : (
                                    <span className="inline-block -rotate-45">
                                      ↙
                                    </span>
                                  )}
                                  {isReceived ? "Received" : "Sent"}
                                </span>
                              </td>
                              <td
                                className={`px-4 py-2 font-mono ${
                                  isReceived ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {isReceived ? "+" : "-"}
                                {tx.value.toFixed(8)} BTC
                              </td>
                              <td className="px-4 py-2">
                                <a
                                  href={`https://mempool.space/tx/${tx.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-muted px-2 py-1 rounded font-mono text-xs hover:underline"
                                >
                                  {tx.hash.slice(0, 12)}...
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
