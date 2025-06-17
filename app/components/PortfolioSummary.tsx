import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Coins, RefreshCw, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { Address, ChainData } from "../types";
import { usePrices } from "../hooks/usePrices";

interface AssetBreakdownItem {
  symbol: string;
  name?: string;
  balance: number;
  usdValue: number;
  chain: string;
  type: 'native' | 'token';
}

interface AddressBreakdown {
  addressLabel: string;
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
}

export function PortfolioSummary({ addresses, onPriceUpdate, onRefreshCallback, onFetchingChange, onDirectRefresh, onAddressUpdate }: PortfolioSummaryProps) {
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
            const symbol = chainData.chain === 'bitcoin' ? 'BTC' : 
                          chainData.chain === 'solana' ? 'SOL' : 'ETH';
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
          const symbol = address.chain === 'bitcoin' ? 'BTC' : 
                        address.chain === 'solana' ? 'SOL' : 'ETH';
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
            const symbol = chainData.chain === 'bitcoin' ? 'BTC' : 
                          chainData.chain === 'solana' ? 'SOL' : 
                          chainData.chain === 'polygon' ? 'POL' : 'ETH';
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
          const symbol = address.chain === 'bitcoin' ? 'BTC' : 
                        address.chain === 'solana' ? 'SOL' : 
                        address.chain === 'polygon' ? 'POL' : 'ETH';
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
          addressLabel: address.label,
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
                  ({portfolioSummary.chainAllocations[0].percentage.toFixed(1)}%)
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
                        {allocation.percentage.toFixed(1)}%
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
                      <Badge variant="secondary" className="font-mono">
                        {token.symbol}
                      </Badge>
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(token.totalBalance)} {token.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(token.usdValue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {token.percentage.toFixed(1)}%
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
              Asset Breakdown
            </CardTitle>
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
              {showBreakdown ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </CardHeader>
        {showBreakdown && (
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Detailed breakdown of all assets by address and chain. Values sorted by USD amount.
              </div>
              
              {assetBreakdown.length > 0 ? (
                <div className="space-y-6">
                  {assetBreakdown.map((addressData, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-muted/30 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{addressData.addressLabel}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {addressData.address.slice(0, 8)}...{addressData.address.slice(-6)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(addressData.totalValue)}</div>
                            <div className="text-xs text-muted-foreground">{addressData.assets.length} assets</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="space-y-3">
                          {addressData.assets.map((asset, assetIndex) => (
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
                    </div>
                  ))}
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