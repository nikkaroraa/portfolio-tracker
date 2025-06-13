import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Edit2, GripVertical, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Address,
  ChainInfo,
  ChainData,
  SUPPORTED_CHAINS,
} from "../types";
import { useBitcoinBalance } from "../hooks/useBitcoinBalance";
import { useEthereumBalance, useAllEthereumChains } from "../hooks/useEthereumBalance";
import { useSolanaBalance } from "../hooks/useSolanaBalance";

function getChainInfo(chainValue: string): ChainInfo | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.value === chainValue);
}

function getChainSymbol(chainValue: string): string {
  const chainInfo = getChainInfo(chainValue);
  if (chainInfo?.symbol) {
    return chainInfo.symbol;
  }
  // Default to ETH for Ethereum-based chains
  if (["ethereum", "arbitrum", "polygon", "optimism", "base"].includes(chainValue)) {
    return "ETH";
  }
  // Default to SOL for Solana
  if (chainValue === "solana") {
    return "SOL";
  }
  return "";
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
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
    case "solana":
      return `https://solscan.io/tx/${txHash}`;
    case "bitcoin":
      return `https://mempool.space/tx/${txHash}`;
    default:
      return "#";
  }
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
  onChainDataUpdate: (id: string, chainData: ChainData[]) => void;
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
  onChainDataUpdate,
}: AddressCardProps) {
  const [isTokensExpanded, setIsTokensExpanded] = useState(false);
  const [selectedChain, setSelectedChain] = useState(
    address.chain === "ethereum" && address.chainData && address.chainData.length > 0
      ? address.chainData[0].chain
      : address.chain
  );
  const chainInfo = getChainInfo(address.chain);
  const { refetch: refetchBitcoinBalance, isFetching: isFetchingBitcoin } =
    useBitcoinBalance(address.chain === "bitcoin" ? address.address : "");
  const { refetch: refetchEthereumBalance, isFetching: isFetchingEthereum } =
    useEthereumBalance(
      ["arbitrum", "polygon", "optimism", "base"].includes(address.chain) ? address.address : "",
      address.chain
    );
  const { refetch: refetchAllChains, isFetching: isFetchingAllChains } =
    useAllEthereumChains(address.chain === "ethereum" ? address.address : "");
  const { refetch: refetchSolanaBalance, isFetching: isFetchingSolana } =
    useSolanaBalance(address.chain === "solana" ? address.address : "");

  const handleRefresh = async () => {
    try {
      if (address.chain === "bitcoin") {
        const { data } = await refetchBitcoinBalance();
        if (data) {
          onBalanceUpdate(address.id, data.balance, data.lastTransactions);
        }
      } else if (address.chain === "ethereum") {
        // Fetch data for all Ethereum chains
        const { data } = await refetchAllChains();
        if (data) {
          onChainDataUpdate(address.id, data);
        }
      } else if (address.chain === "solana") {
        const { data } = await refetchSolanaBalance();
        if (data) {
          onBalanceUpdate(
            address.id,
            data.balance,
            data.lastTransactions,
            data.tokens
          );
        }
      } else if (
        ["arbitrum", "polygon", "optimism", "base"].includes(address.chain)
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

  const isFetching = isFetchingBitcoin || isFetchingEthereum || isFetchingAllChains || isFetchingSolana;

  // Get data for the selected chain
  const getSelectedChainData = () => {
    if (address.chain === "ethereum" && address.chainData) {
      return address.chainData.find(chain => chain.chain === selectedChain);
    }
    // For non-Ethereum chains, return the address data itself
    return {
      chain: address.chain,
      balance: address.balance,
      tokens: address.tokens,
      lastTransactions: address.lastTransactions,
      lastUpdated: address.lastUpdated,
    };
  };

  const selectedChainData = getSelectedChainData();

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
                {address.lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    • Updated {formatDate(new Date(address.lastUpdated))}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground font-medium">
                  {chainInfo?.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(address.chain === "bitcoin" || address.chain === "ethereum" || address.chain === "solana") && (
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
          {/* Address */}
          <div>
            <Label className="text-sm text-muted-foreground">Address</Label>
            <p className="font-mono text-sm break-all bg-muted p-2 rounded">
              {address.address}
            </p>
          </div>

          {/* Chain Selector for Ethereum addresses */}
          {address.chain === "ethereum" && address.chainData && address.chainData.length > 0 && (
            <div>
              <Label className="text-sm text-muted-foreground">Select Chain</Label>
              <Select value={selectedChain} onValueChange={setSelectedChain}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {address.chainData.map((chainData) => {
                    const info = getChainInfo(chainData.chain);
                    return (
                      <SelectItem key={chainData.chain} value={chainData.chain}>
                        <div className="flex items-center gap-2">
                          {info && <div className={`w-3 h-3 rounded-full ${info.color}`} />}
                          {info?.label || chainData.chain}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Balance */}
          <div>
            <Label className="text-sm text-muted-foreground">Balance</Label>
            <p className="font-semibold text-lg">
              {selectedChainData?.balance !== undefined
                ? `${selectedChainData.balance.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 6,
                  })} ${getChainSymbol(selectedChain)}`
                : "Not fetched yet"}
            </p>
          </div>

          {/* Token Balances */}
          {selectedChainData?.tokens && selectedChainData.tokens.length > 0 && (
            <div>
              <Button
                variant="ghost"
                onClick={() => setIsTokensExpanded(!isTokensExpanded)}
                className="flex items-center gap-2 p-0 h-auto text-sm text-muted-foreground hover:text-foreground mb-3"
              >
                {isTokensExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Token Balances ({selectedChainData.tokens.length})
              </Button>
              {isTokensExpanded && (
                <div className="grid gap-3 mt-2 max-h-64 overflow-y-auto">
                  {selectedChainData.tokens.map((token) => (
                    <div
                      key={token.contractAddress}
                      className="flex justify-between items-center bg-muted p-4 rounded"
                    >
                      <div>
                        <p className="font-medium">{token.name}</p>
                        <p className="text-sm text-muted-foreground">{token.symbol}</p>
                      </div>
                      <p className="font-mono font-medium">
                        {formatTokenBalance(token.balance)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Transactions */}
          {selectedChainData?.lastTransactions && selectedChainData.lastTransactions.length > 0 && (
            <div>
              <Label className="text-sm text-muted-foreground mb-3 block">
                Recent Transactions
              </Label>
              <div className="overflow-x-auto rounded border bg-white dark:bg-card">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedChainData.lastTransactions.slice(0, 5).map((tx) => {
                      const isReceived = tx.type === "received";
                      // Bitcoin timestamps are in seconds, Ethereum timestamps are already in milliseconds
                      const timestampMs = selectedChain === "bitcoin" ? tx.timestamp * 1000 : tx.timestamp;
                      return (
                        <tr
                          key={tx.hash}
                          className="border-b last:border-0 hover:bg-muted/20"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <a
                              href={getExplorerUrl(selectedChain, tx.hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                            >
                              {formatDate(new Date(timestampMs))}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                isReceived
                                  ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                  : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                              }`}
                            >
                              {isReceived ? "↓ Received" : "↑ Sent"}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-right">
                            <span className={isReceived ? "text-green-600" : "text-red-600"}>
                              {isReceived ? "+" : "-"}{tx.value.toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 6,
                              })} {tx.asset || getChainSymbol(selectedChain)}
                            </span>
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
      </CardContent>
    </Card>
  );
}
