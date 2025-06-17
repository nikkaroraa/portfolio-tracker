import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Trash2, Edit2, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  Address,
  ChainInfo,
  ChainData,
  SUPPORTED_CHAINS,
} from "../types";
import { useBitcoinBalance } from "../hooks/useBitcoinBalance";
import { useAllEthereumChains } from "../hooks/useEthereumBalance";
import { useSolanaBalance } from "../hooks/useSolanaBalance";
import { CHAIN_SYMBOLS, ChainType } from "../lib/constants";

function getChainInfo(chainValue: string): ChainInfo | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.value === chainValue);
}

function getChainSymbol(chainValue: string): string {
  return CHAIN_SYMBOLS[chainValue as ChainType] || '';
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

function getAddressExplorerUrl(chain: string, address: string): string {
  switch (chain) {
    case "ethereum":
      return `https://etherscan.io/address/${address}`;
    case "arbitrum":
      return `https://arbiscan.io/address/${address}`;
    case "polygon":
      return `https://polygonscan.com/address/${address}`;
    case "optimism":
      return `https://optimistic.etherscan.io/address/${address}`;
    case "base":
      return `https://basescan.org/address/${address}`;
    case "solana":
      return `https://solscan.io/account/${address}`;
    case "bitcoin":
      return `https://mempool.space/address/${address}`;
    default:
      return "#";
  }
}


interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
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
  onBalanceUpdate,
  onChainDataUpdate,
}: AddressCardProps) {
  const [isTokensExpanded, setIsTokensExpanded] = useState(false);
  const [isTransactionsExpanded, setIsTransactionsExpanded] = useState(false);
  const [selectedChain, setSelectedChain] = useState(
    address.chain === "ethereum" && address.chainData && address.chainData.length > 0
      ? address.chainData[0].chain
      : address.chain
  );
  const chainInfo = getChainInfo(address.chain);
  const { refetch: refetchBitcoinBalance, isFetching: isFetchingBitcoin } =
    useBitcoinBalance(address.chain === "bitcoin" ? address.address : "");
  const { refetch: refetchAllChains, isFetching: isFetchingAllChains } =
    useAllEthereumChains(
      address.chain === "ethereum" || ["arbitrum", "polygon", "optimism", "base"].includes(address.chain) 
        ? address.address 
        : ""
    );
  const { refetch: refetchSolanaBalance, isFetching: isFetchingSolana } =
    useSolanaBalance(address.chain === "solana" ? address.address : "");

  const handleRefresh = useCallback(async () => {
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
        // For L2 addresses, fetch data from all Ethereum chains and upgrade to multi-chain
        const { data } = await refetchAllChains();
        if (data) {
          onChainDataUpdate(address.id, data);
        }
      }
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
  }, [
    address.chain,
    address.id,
    refetchBitcoinBalance,
    refetchAllChains,
    refetchSolanaBalance,
    onBalanceUpdate,
    onChainDataUpdate
  ]);

  const isFetching = isFetchingBitcoin || isFetchingAllChains || isFetchingSolana;

  // Listen for refresh all event
  useEffect(() => {
    const handleRefreshAllEvent = () => {
      handleRefresh();
    };

    window.addEventListener('refreshAllAddresses', handleRefreshAllEvent);
    
    return () => {
      window.removeEventListener('refreshAllAddresses', handleRefreshAllEvent);
    };
  }, [handleRefresh]);

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
    <Card className="transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <div>
                <a
                  href={getAddressExplorerUrl(address.chain, address.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-mono text-foreground font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer transition-colors"
                >
                  {address.address}
                </a>
              </div>
              <div className="flex items-center gap-2">
                {chainInfo && (
                  <div className={`w-3 h-3 rounded-full ${chainInfo.color}`} />
                )}
                <Badge variant="secondary">
                  {chainInfo?.symbol || address.chain.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  {chainInfo?.label}
                </span>
                {address.lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    • Updated {formatDate(new Date(address.lastUpdated))}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(address.chain === "bitcoin" || address.chain === "ethereum" || address.chain === "solana" || ["arbitrum", "polygon", "optimism", "base"].includes(address.chain)) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isFetching}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => onEdit(address)} className="cursor-pointer">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(address.id)}
              className="cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Tags */}
          {address.tags && address.tags.length > 0 && (
            <div>
              <Label className="text-sm text-muted-foreground">Tags</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {address.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" style={{ backgroundColor: tag.color + '20', borderColor: tag.color }}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {address.description && (
            <div>
              <Label className="text-sm text-muted-foreground">Description</Label>
              <p className="text-sm text-foreground mt-1">
                {address.description}
              </p>
            </div>
          )}

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
              {selectedChainData?.balance !== undefined && selectedChainData.balance !== null
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
                className="flex items-center gap-2 p-0 h-auto text-sm text-muted-foreground hover:text-foreground mb-3 cursor-pointer"
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
              <Button
                variant="ghost"
                onClick={() => setIsTransactionsExpanded(!isTransactionsExpanded)}
                className="flex items-center gap-2 p-0 h-auto text-sm text-muted-foreground hover:text-foreground mb-3 cursor-pointer"
              >
                {isTransactionsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Recent Transactions ({selectedChainData.lastTransactions.length})
              </Button>
              {isTransactionsExpanded && (
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
                      {selectedChainData.lastTransactions.slice(0, 5).map((tx, index) => {
                        const isReceived = tx.type === "received";
                        // Bitcoin timestamps are in seconds, Ethereum timestamps are already in milliseconds
                        const timestampMs = selectedChain === "bitcoin" ? tx.timestamp * 1000 : tx.timestamp;
                        return (
                          <tr
                            key={`${tx.hash}-${index}`}
                            className="border-b last:border-0 hover:bg-muted/20"
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <a
                                href={getExplorerUrl(selectedChain, tx.hash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer"
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
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
