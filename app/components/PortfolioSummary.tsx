import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Coins, RefreshCw, AlertTriangle, ChevronDown, ChevronRight, Plus, Edit2, Trash2 } from "lucide-react";
import { Address, ChainData } from "../types";
import { usePrices } from "../hooks/usePrices";
import { CHAIN_SYMBOLS } from "../lib/constants";
import { AddressCard } from "./AddressCard";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

interface AssetBreakdownItem {
  symbol: string;
  name?: string;
  balance: number;
  usdValue: number;
  chain: string;
  type: 'native' | 'token';
}

interface AddressBreakdown {
  addressName: string;
  address: string;
  assets: AssetBreakdownItem[];
  totalValue: number;
}

declare global {
  interface Window {
    refreshPricesDirectly?: () => Promise<void>;
  }
}
import { useAllEthereumChains } from "../hooks/useEthereumBalance";
import { 
  calculatePortfolioSummary, 
  formatCurrency, 
  formatPercentage, 
  formatNumber 
} from "../lib/portfolio";

interface PortfolioSummaryProps {
  addresses: Address[];
  onPriceUpdate?: (date: Date) => void;
  onRefreshCallback?: (refreshFn: () => Promise<void>) => void;
  onFetchingChange?: (isFetching: boolean) => void;
  onDirectRefresh?: () => void;
  onAddressUpdate?: (id: string, chainData: ChainData[]) => void;
  // Wallet management props
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  onAddClick?: () => void;
  onBalanceUpdate?: (
    id: string,
    balance: number,
    lastTransactions?: Address["lastTransactions"],
    tokens?: Address["tokens"]
  ) => void;
}

export function PortfolioSummary({ 
  addresses, 
  onPriceUpdate, 
  onRefreshCallback, 
  onFetchingChange, 
  onDirectRefresh, 
  onAddressUpdate,
  onEdit,
  onDelete,
  onAddClick,
  onBalanceUpdate
}: PortfolioSummaryProps) {
  const [showBreakdown, setShowBreakdown] = React.useState(false);
  
  // Get all Ethereum addresses (including L2s)
  const ethereumAddresses = React.useMemo(() => {
    return addresses.filter(addr => 
      addr.chain === 'ethereum' || 
      ['arbitrum', 'polygon', 'optimism', 'base'].includes(addr.chain)
    );
  }, [addresses]);
  
  // Create hooks for each Ethereum address  
  const ethereumQueries = ethereumAddresses.map(addr => 
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAllEthereumChains(addr.address)
  );
  
  // Listen for refresh events from dashboard
  React.useEffect(() => {
    const handleRefreshEvent = async () => {
      // Trigger refresh for all Ethereum addresses
      for (let i = 0; i < ethereumQueries.length; i++) {
        const query = ethereumQueries[i];
        const address = ethereumAddresses[i];
        
        try {
          const result = await query.refetch();
          
          // Update the address data if callback is provided
          if (result.data && onAddressUpdate) {
            onAddressUpdate(address.id, result.data);
          }
        } catch (error) {
          console.error('Error refreshing address:', error);
        }
      }
    };

    window.addEventListener('refreshAllAddresses', handleRefreshEvent);
    
    return () => {
      window.removeEventListener('refreshAllAddresses', handleRefreshEvent);
    };
  }, [ethereumQueries, ethereumAddresses, onAddressUpdate]);
  
  // Extract all unique symbols from addresses
  const symbols = React.useMemo(() => {
    const symbolSet = new Set<string>();
    
    addresses.forEach(address => {
      if (address.chain === 'ethereum' && address.chainData) {
        address.chainData.forEach(chainData => {
          if (chainData.balance && chainData.balance > 0) {
            const symbol = CHAIN_SYMBOLS[chainData.chain as keyof typeof CHAIN_SYMBOLS] || 'ETH';
            symbolSet.add(symbol);
          }
          chainData.tokens?.forEach(token => {
            if (Number(token.balance) > 0) {
              symbolSet.add(token.symbol);
            }
          });
        });
      } else {
        if (address.balance && address.balance > 0) {
          const symbol = CHAIN_SYMBOLS[address.chain as keyof typeof CHAIN_SYMBOLS] || 'ETH';
          symbolSet.add(symbol);
        }
        address.tokens?.forEach(token => {
          if (Number(token.balance) > 0) {
            symbolSet.add(token.symbol);
          }
        });
      }
    });
    
    return Array.from(symbolSet);
  }, [addresses]);

  const { data: prices, isLoading: isPricesLoading, error: pricesError, refetch: refetchPrices, isFetching: isFetchingPrices } = usePrices(symbols);

  const portfolioSummary = React.useMemo(() => {
    if (!prices || addresses.length === 0) return null;
    return calculatePortfolioSummary(addresses, prices);
  }, [addresses, prices]);

  // Asset breakdown data for detailed view
  const assetBreakdown = React.useMemo(() => {
    if (!prices) return [];
    
    const breakdown: AddressBreakdown[] = [];
    
    addresses.forEach(address => {
      const assets: AssetBreakdownItem[] = [];
      
      if (address.chain === 'ethereum' && address.chainData) {
        // Multi-chain Ethereum addresses
        address.chainData.forEach(chainData => {
          if (chainData.balance && chainData.balance > 0) {
            const symbol = CHAIN_SYMBOLS[chainData.chain as keyof typeof CHAIN_SYMBOLS] || 'ETH';
            const price = prices[symbol]?.price || 0;
            const usdValue = chainData.balance * price;
            
            assets.push({
              symbol,
              balance: chainData.balance,
              usdValue,
              chain: chainData.chain,
              type: 'native'
            });
          }
          
          chainData.tokens?.forEach(token => {
            if (Number(token.balance) > 0) {
              const price = prices[token.symbol]?.price || 0;
              const balance = Number(token.balance);
              const usdValue = balance * price;
              
              assets.push({
                symbol: token.symbol,
                name: token.name,
                balance,
                usdValue,
                chain: chainData.chain,
                type: 'token'
              });
            }
          });
        });
      } else {
        // Single-chain addresses
        if (address.balance && address.balance > 0) {
          const symbol = CHAIN_SYMBOLS[address.chain as keyof typeof CHAIN_SYMBOLS] || 'ETH';
          const price = prices[symbol]?.price || 0;
          const usdValue = address.balance * price;
          
          assets.push({
            symbol,
            balance: address.balance,
            usdValue,
            chain: address.chain,
            type: 'native'
          });
        }
        
        address.tokens?.forEach(token => {
          if (Number(token.balance) > 0) {
            const price = prices[token.symbol]?.price || 0;
            const balance = Number(token.balance);
            const usdValue = balance * price;
            
            assets.push({
              symbol: token.symbol,
              name: token.name,
              balance,
              usdValue,
              chain: address.chain,
              type: 'token'
            });
          }
        });
      }
      
      if (assets.length > 0) {
        const totalValue = assets.reduce((sum, asset) => sum + asset.usdValue, 0);
        breakdown.push({
          addressName: address.name,
          address: address.address,
          assets: assets.sort((a, b) => b.usdValue - a.usdValue),
          totalValue
        });
      }
    });
    
    return breakdown.sort((a, b) => b.totalValue - a.totalValue);
  }, [addresses, prices]);


  const handleRefreshPrices = React.useCallback(() => {
    return refetchPrices().then(() => {
      if (onPriceUpdate) {
        onPriceUpdate(new Date());
      }
    }).catch((error) => {
      console.error('Failed to refresh prices:', error);
    });
  }, [refetchPrices, onPriceUpdate]);

  // Provide refresh function to parent
  React.useEffect(() => {
    if (onRefreshCallback) {
      onRefreshCallback(handleRefreshPrices);
    }
  }, [handleRefreshPrices, onRefreshCallback]);

  // Also provide a direct refresh method
  React.useEffect(() => {
    if (onDirectRefresh) {
      window.refreshPricesDirectly = async (): Promise<void> => {
        try {
          await refetchPrices();
          if (onPriceUpdate) {
            onPriceUpdate(new Date());
          }
        } catch (error) {
          console.error('Failed to refresh prices:', error);
        }
      };
    }
  }, [refetchPrices, onPriceUpdate, onDirectRefresh]);

  // Notify parent of fetching state changes
  React.useEffect(() => {
    if (onFetchingChange) {
      onFetchingChange(isFetchingPrices);
    }
  }, [isFetchingPrices, onFetchingChange]);

  // Notify parent when prices are successfully loaded
  React.useEffect(() => {
    if (prices && onPriceUpdate && !isPricesLoading && !pricesError) {
      onPriceUpdate(new Date());
    }
  }, [prices, onPriceUpdate, isPricesLoading, pricesError]);

  if (addresses.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Add some wallet addresses to see your portfolio summary</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPricesLoading || !portfolioSummary) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositiveChange = portfolioSummary.change24h >= 0;

  return (
    <div className="mb-6 space-y-6">
      {/* Price Error Alert */}
      {pricesError && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-red-800 dark:text-red-200 mb-1">
                Unable to fetch cryptocurrency prices
              </div>
              <div className="text-sm text-red-600 dark:text-red-300">
                {pricesError instanceof Error && pricesError.message.includes('Rate limit') 
                  ? 'Rate limit reached. Please wait a moment before trying again.'
                  : pricesError instanceof Error 
                    ? pricesError.message 
                    : 'This might be due to network issues or rate limiting.'}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshPrices}
              disabled={isFetchingPrices}
              className="ml-4 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${isFetchingPrices ? 'animate-spin' : ''}`} />
              {isFetchingPrices ? 'Retrying...' : 'Try Again'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Value */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Total Portfolio Value
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(portfolioSummary.totalValue)}
              </div>
              <div className={`flex items-center gap-1 text-sm ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                {isPositiveChange ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {formatPercentage(portfolioSummary.change24h)} (24h)
              </div>
            </div>

            {/* Total Assets */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Coins className="h-4 w-4" />
                Total Assets
              </div>
              <div className="text-2xl font-bold">
                {portfolioSummary.totalAssets}
              </div>
              <div className="text-sm text-muted-foreground">
                Across {portfolioSummary.chainAllocations.length} chains
              </div>
            </div>

            {/* Top Asset */}
            {portfolioSummary.chainAllocations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PieChart className="h-4 w-4" />
                  Largest Allocation
                </div>
                <div className="text-2xl font-bold">
                  {portfolioSummary.chainAllocations[0].label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(portfolioSummary.chainAllocations[0].usdValue)} 
                  ({portfolioSummary.chainAllocations[0].percentage.toFixed(2)}%)
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chain Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chain Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioSummary.chainAllocations.map((allocation) => (
                <div key={allocation.chain} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${allocation.color}`} />
                      <span className="font-medium">{allocation.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(allocation.usdValue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {allocation.percentage.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${allocation.color}`}
                      style={{ width: `${allocation.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Holdings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioSummary.topTokens.length > 0 ? (
                portfolioSummary.topTokens.slice(0, 5).map((token) => (
                  <div key={token.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{token.name} <Badge variant="secondary" className="font-mono ml-2">{token.symbol}</Badge></div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(token.totalBalance)} {token.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(token.usdValue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {token.percentage.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No holdings found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Breakdown Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5" />
              Wallet Details
            </CardTitle>
            <div className="flex items-center gap-2">
              {onAddClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddClick}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Wallet
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="cursor-pointer"
              >
                {showBreakdown ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {showBreakdown ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showBreakdown && (
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Detailed breakdown of all assets by address and chain. Values sorted by USD amount.
              </div>
              
              {addresses.length > 0 ? (
                <div className="space-y-6">
                  {addresses.map((address) => {
                    // Find corresponding asset breakdown data
                    const addressBreakdown = assetBreakdown.find(breakdown => 
                      breakdown.address === address.address
                    );
                    
                    return (
                      <div key={address.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-muted/30 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{address.name || 'Unnamed Wallet'}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {address.address.slice(0, 12)}...{address.address.slice(-8)}
                              </div>
                              {address.description && (
                                <div className="text-xs text-muted-foreground mt-1">{address.description}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="font-semibold">
                                  {addressBreakdown ? formatCurrency(addressBreakdown.totalValue) : 'Loading...'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {addressBreakdown ? `${addressBreakdown.assets.length} assets` : ''}
                                </div>
                              </div>
                              {onEdit && onDelete && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(address)}
                                    className="cursor-pointer h-8 w-8 p-0"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(address.id)}
                                    className="cursor-pointer h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-4">
                          {/* Assets Section */}
                          {addressBreakdown && addressBreakdown.assets.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-3">Assets</h4>
                              <div className="space-y-3">
                                {addressBreakdown.assets.map((asset, assetIndex) => (
                                  <div key={assetIndex} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline" className="text-xs">
                                        {asset.chain}
                                      </Badge>
                                      <Badge variant={asset.type === 'native' ? 'default' : 'secondary'} className="text-xs">
                                        {asset.type}
                                      </Badge>
                                      <div>
                                        <div className="font-medium">{asset.symbol}</div>
                                        {asset.name && asset.name !== asset.symbol && (
                                          <div className="text-xs text-muted-foreground">{asset.name}</div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">{formatCurrency(asset.usdValue)}</div>
                                      <div className="text-xs text-muted-foreground font-mono">
                                        {formatNumber(asset.balance)} {asset.symbol}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Recent Transactions Section */}
                          {(() => {
                            // Collect all transactions from all chains
                            const allTransactions: Array<{tx: any, chain: string}> = [];
                            
                            // For ethereum addresses with chainData
                            if (address.chain === 'ethereum' && address.chainData) {
                              address.chainData.forEach(chainData => {
                                if (chainData.lastTransactions) {
                                  chainData.lastTransactions.forEach(tx => {
                                    allTransactions.push({ tx, chain: chainData.chain });
                                  });
                                }
                              });
                            } else if (address.lastTransactions) {
                              // For other chains (Bitcoin, Solana, etc)
                              address.lastTransactions.forEach(tx => {
                                allTransactions.push({ tx, chain: address.chain });
                              });
                            }
                            
                            if (allTransactions.length === 0) return null;
                            
                            // Sort by timestamp (newest first)
                            allTransactions.sort((a, b) => {
                              const aTime = a.chain === "bitcoin" ? a.tx.timestamp * 1000 : a.tx.timestamp;
                              const bTime = b.chain === "bitcoin" ? b.tx.timestamp * 1000 : b.tx.timestamp;
                              return bTime - aTime;
                            });
                            
                            return (
                              <div>
                                <h4 className="font-medium text-sm mb-3">Recent Transactions</h4>
                                <div className="overflow-x-auto rounded border bg-white dark:bg-card">
                                  <table className="min-w-full text-sm">
                                    <thead>
                                      <tr className="border-b bg-muted/30">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Chain</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {allTransactions.slice(0, 10).map(({tx, chain}, txIndex) => {
                                        const isReceived = tx.type === "received";
                                        const timestampMs = chain === "bitcoin" ? tx.timestamp * 1000 : tx.timestamp;
                                        return (
                                          <tr key={`${tx.hash}-${txIndex}`} className="border-b last:border-0 hover:bg-muted/20">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <a
                                                href={getExplorerUrl(chain, tx.hash)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer"
                                              >
                                                {formatDate(new Date(timestampMs))}
                                              </a>
                                            </td>
                                            <td className="px-4 py-3">
                                              <Badge variant="outline" className="text-xs">
                                                {chain}
                                              </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                                isReceived
                                                  ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                                  : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                              }`}>
                                                {isReceived ? "↓ Received" : "↑ Sent"}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-right">
                                              <span className={isReceived ? "text-green-600" : "text-red-600"}>
                                                {isReceived ? "+" : "-"}{tx.value.toLocaleString(undefined, {
                                                  minimumFractionDigits: 0,
                                                  maximumFractionDigits: 6,
                                                })} {tx.asset || CHAIN_SYMBOLS[chain as keyof typeof CHAIN_SYMBOLS]}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No assets to display</p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>


    </div>
  );
}