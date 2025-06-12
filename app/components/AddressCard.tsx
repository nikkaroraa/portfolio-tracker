import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, GripVertical, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Address,
  ChainInfo,
  SUPPORTED_CHAINS,
  SUPPORTED_ETHEREUM_NETWORKS,
} from "../types";
import { useBitcoinBalance } from "../hooks/useBitcoinBalance";
import { useEthereumBalance } from "../hooks/useEthereumBalance";

function getChainInfo(chainValue: string): ChainInfo | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.value === chainValue);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTokenBalance(balance: string): string {
  const numBalance = Number(balance);
  return numBalance.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

function getExplorerUrl(chain: string, txHash: string): string {
  switch (chain) {
    case "ethereum":
      return `https://etherscan.io/tx/${txHash}`;
    case "arbitrum":
      return `https://arbiscan.io/tx/${txHash}`;
    case "polygon":
      return `https://polygonscan.com/tx/${txHash}`;
    case "optimism":
      return `https://optimistic.etherscan.io/tx/${txHash}`;
    case "base":
      return `https://basescan.org/tx/${txHash}`;
    default:
      return "#";
  }
}

function getNetworkLabel(chain: string, network?: string): string | undefined {
  if (chain === "ethereum" && network) {
    const net = SUPPORTED_ETHEREUM_NETWORKS.find((n) => n.value === network);
    return net?.label;
  }
  return undefined;
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
    lastTransactions?: Address["lastTransactions"],
    tokens?: Address["tokens"]
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
  const [isTokensExpanded, setIsTokensExpanded] = useState(false);
  const chainInfo = getChainInfo(address.chain);
  const { refetch: refetchBitcoinBalance, isFetching: isFetchingBitcoin } =
    useBitcoinBalance(address.address);
  const { refetch: refetchEthereumBalance, isFetching: isFetchingEthereum } =
    useEthereumBalance(address.address, address.chain);

  const handleRefresh = async () => {
    try {
      if (address.chain === "bitcoin") {
        const { data } = await refetchBitcoinBalance();
        if (data) {
          onBalanceUpdate(address.id, data.balance, data.lastTransactions);
        }
      } else if (
        ["ethereum", "arbitrum", "polygon", "optimism", "base"].includes(
          address.chain
        )
      ) {
        const { data } = await refetchEthereumBalance();
        if (data) {
          onBalanceUpdate(
            address.id,
            data.balance,
            data.lastTransactions,
            data.tokens
          );
        }
      }
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
  };

  const isFetching = isFetchingBitcoin || isFetchingEthereum;

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
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                {chainInfo && (
                  <div className={`w-3 h-3 rounded-full ${chainInfo.color}`} />
                )}
                <CardTitle className="text-lg">{address.label}</CardTitle>
                <Badge variant="secondary">
                  {chainInfo?.symbol || address.chain.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground font-medium">
                  {chainInfo?.label}
                </span>
                {address.chain === "ethereum" && address.network && (
                  <span className="text-xs text-muted-foreground font-medium">
                    | {getNetworkLabel(address.chain, address.network)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(address.chain === "bitcoin" || address.chain === "ethereum") && (
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
                    ? `${address.balance.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 6,
                      })} ${chainInfo?.symbol || address.chain.toUpperCase()}`
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

            {/* Token Balances */}
            {address.tokens && address.tokens.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setIsTokensExpanded(!isTokensExpanded)}
                  className="flex items-center gap-2 p-0 h-auto text-sm text-muted-foreground hover:text-foreground mb-2"
                >
                  {isTokensExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  Token Balances ({address.tokens.length})
                </Button>
                {isTokensExpanded && (
                  <div className="grid gap-2 mt-2 max-h-64 overflow-y-auto">
                    {address.tokens.map((token) => (
                      <div
                        key={token.contractAddress}
                        className="flex justify-between items-center bg-muted p-3 rounded"
                      >
                        <div>
                          <p className="font-medium text-sm">{token.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {token.symbol}
                          </p>
                        </div>
                        <p className="font-mono text-sm font-medium">
                          {formatTokenBalance(token.balance)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recent Transactions */}
            {address.lastTransactions &&
              address.lastTransactions.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-3 block">
                    Recent Transactions
                  </Label>
                  <div className="overflow-x-auto rounded border bg-white dark:bg-card">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            Date
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            Type
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                            Amount
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            Hash
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {address.lastTransactions.slice(0, 5).map((tx) => {
                          const isReceived = tx.type === "received";
                          const timestampMs = address.chain === "bitcoin" ? tx.timestamp * 1000 : tx.timestamp;
                          return (
                            <tr
                              key={tx.hash}
                              className="border-b last:border-0 hover:bg-muted/20"
                            >
                              <td className="px-3 py-2 whitespace-nowrap">
                                {formatDate(new Date(timestampMs))}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    isReceived
                                      ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                      : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                  }`}
                                >
                                  {isReceived ? "↓ Received" : "↑ Sent"}
                                </span>
                              </td>
                              <td className="px-3 py-2 font-mono text-right">
                                <span className={isReceived ? "text-green-600" : "text-red-600"}>
                                  {isReceived ? "+" : "-"}{tx.value.toLocaleString(undefined, {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 6,
                                  })} {tx.asset || chainInfo?.symbol || "Unknown"}
                                </span>
                              </td>
                              <td className="px-3 py-2 font-mono">
                                <a
                                  href={getExplorerUrl(address.chain, tx.hash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
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
