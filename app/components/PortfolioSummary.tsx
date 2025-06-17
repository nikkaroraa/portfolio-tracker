import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Coins, RefreshCw, AlertTriangle, ChevronDown, ChevronRight, Bug } from "lucide-react";
import { Address, ChainData } from "../types";
import { usePrices } from "../hooks/usePrices";

interface DebugAsset {
  addressLabel: string;
  address: string;
  chain: string;
  type: 'native' | 'token';
  symbol: string;
  name?: string;
  contractAddress?: string;
  rawBalance: number;
  decimals: string | number;
  price: number;
  usdValue: number;
  dataSource: string;
}

interface TokenInfo {
  symbol: string;
  name: string;
  balance: string;
  chain: string;
  address: string;
  contractAddress?: string;
}

declare global {
  interface Window {
    allTokensFound?: TokenInfo[];
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
  const [showDebug, setShowDebug] = React.useState(false);
  
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
      console.log('🔍 PortfolioSummary: Received refreshAllAddresses event');
      console.log(`🔍 PortfolioSummary: Found ${ethereumQueries.length} Ethereum addresses to refresh`);
      
      // Trigger refresh for all Ethereum addresses
      for (let i = 0; i < ethereumQueries.length; i++) {
        const query = ethereumQueries[i];
        const address = ethereumAddresses[i];
        
        try {
          console.log(`🔍 PortfolioSummary: Calling refetch for ${address.address}`);
          const result = await query.refetch();
          
          console.log(`🔍 PortfolioSummary: Refetch result for ${address.address}:`, result);
          console.log(`🔍 PortfolioSummary: Has data:`, !!result.data);
          console.log(`🔍 PortfolioSummary: Has onAddressUpdate:`, !!onAddressUpdate);
          
          // Update the address data if callback is provided
          if (result.data && onAddressUpdate) {
            console.log(`🔍 PortfolioSummary: Updating address ${address.address} with new data:`, result.data);
            onAddressUpdate(address.id, result.data);
          } else {
            console.log(`🔍 PortfolioSummary: NOT updating address - missing data or callback`);
          }
        } catch (error) {
          console.error('🔍 PortfolioSummary: Error refreshing address:', error);
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

  // Debug data to show raw asset information
  const debugData = React.useMemo(() => {
    if (!prices) return [];
    
    const assets: DebugAsset[] = [];
    const allTokensFound: TokenInfo[] = []; // Track ALL tokens before filtering
    
    addresses.forEach(address => {
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
              addressLabel: address.label,
              address: address.address,
              chain: chainData.chain,
              type: 'native',
              symbol,
              rawBalance: chainData.balance,
              decimals: 'auto (18 for ETH, 8 for BTC, 9 for SOL)',
              price,
              usdValue,
              dataSource: 'chainData'
            });
          }
          
          chainData.tokens?.forEach(token => {
            // Track ALL tokens found, regardless of balance
            allTokensFound.push({
              symbol: token.symbol,
              name: token.name,
              balance: token.balance,
              chain: chainData.chain,
              address: address.label,
              contractAddress: token.contractAddress
            });
            
            if (Number(token.balance) > 0) {
              const price = prices[token.symbol]?.price || 0;
              const balance = Number(token.balance);
              const usdValue = balance * price;
              
              assets.push({
                addressLabel: address.label,
                address: address.address,
                chain: chainData.chain,
                type: 'token',
                symbol: token.symbol,
                name: token.name,
                contractAddress: token.contractAddress,
                rawBalance: balance,
                decimals: token.decimals || 'unknown',
                price,
                usdValue,
                dataSource: 'chainData.tokens'
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
            addressLabel: address.label,
            address: address.address,
            chain: address.chain,
            type: 'native',
            symbol,
            rawBalance: address.balance,
            decimals: 'auto (18 for ETH, 8 for BTC, 9 for SOL)',
            price,
            usdValue,
            dataSource: 'direct'
          });
        }
        
        address.tokens?.forEach(token => {
          // Track ALL tokens found, regardless of balance
          allTokensFound.push({
            symbol: token.symbol,
            name: token.name,
            balance: token.balance,
            chain: address.chain,
            address: address.label,
            contractAddress: token.contractAddress
          });
          
          if (Number(token.balance) > 0) {
            const price = prices[token.symbol]?.price || 0;
            const balance = Number(token.balance);
            const usdValue = balance * price;
            
            assets.push({
              addressLabel: address.label,
              address: address.address,
              chain: address.chain,
              type: 'token',
              symbol: token.symbol,
              name: token.name,
              contractAddress: token.contractAddress,
              rawBalance: balance,
              decimals: token.decimals || 'unknown',
              price,
              usdValue,
              dataSource: 'direct.tokens'
            });
          }
        });
      }
    });
    
    // Store allTokensFound in window for debugging
    window.allTokensFound = allTokensFound;
    
    return assets.sort((a, b) => b.usdValue - a.usdValue);
  }, [addresses, prices]);

  // Group debug data by address for better readability
  const groupedDebugData = React.useMemo(() => {
    const grouped = debugData.reduce((acc, asset) => {
      const key = `${asset.addressLabel}_${asset.address}`;
      if (!acc[key]) {
        acc[key] = {
          addressLabel: asset.addressLabel,
          address: asset.address,
          assets: [],
          totalValue: 0
        };
      }
      acc[key].assets.push(asset);
      acc[key].totalValue += asset.usdValue;
      return acc;
    }, {} as Record<string, { addressLabel: string; address: string; assets: DebugAsset[]; totalValue: number }>);
    
    return Object.values(grouped).sort((a, b) => b.totalValue - a.totalValue);
  }, [debugData]);

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
      // Assign the refetch function directly to a global or pass it up
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

      {/* Debug Section */}
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
              onClick={() => setShowDebug(!showDebug)}
              className="cursor-pointer"
            >
              {showDebug ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {showDebug ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </CardHeader>
        {showDebug && (
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Detailed breakdown of all assets across your addresses. Each row represents one asset from one address, showing exactly how values are calculated.
              </div>
              
              {groupedDebugData.length > 0 ? (
                <div className="space-y-6">
                  {groupedDebugData.map((group, groupIndex) => (
                    <div key={groupIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-muted/30 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{group.addressLabel}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {group.address.slice(0, 8)}...{group.address.slice(-6)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${group.totalValue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}</div>
                            <div className="text-xs text-muted-foreground">{group.assets.length} assets</div>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="bg-muted/20">
                              <th className="border-r border-gray-200 dark:border-gray-700 px-3 py-2 text-left">Chain</th>
                              <th className="border-r border-gray-200 dark:border-gray-700 px-3 py-2 text-left">Type</th>
                              <th className="border-r border-gray-200 dark:border-gray-700 px-3 py-2 text-left">Asset</th>
                              <th className="border-r border-gray-200 dark:border-gray-700 px-3 py-2 text-left">Balance</th>
                              <th className="border-r border-gray-200 dark:border-gray-700 px-3 py-2 text-left">Price</th>
                              <th className="px-3 py-2 text-left">USD Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.assets.map((asset, assetIndex) => (
                              <tr key={assetIndex} className="hover:bg-muted/10 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                                <td className="border-r border-gray-200 dark:border-gray-700 px-3 py-2">
                                  <Badge variant="outline" className="text-xs">
                                    {asset.chain}
                                  </Badge>
                                </td>
                                <td className="border-r border-gray-200 dark:border-gray-700 px-3 py-2">
                                  <Badge variant={asset.type === 'native' ? 'default' : 'secondary'} className="text-xs">
                                    {asset.type}
                                  </Badge>
                                </td>
                                <td className="border-r border-gray-200 dark:border-gray-700 px-3 py-2">
                                  <div>
                                    <div className="font-medium">{asset.symbol}</div>
                                    {asset.name && asset.name !== asset.symbol && (
                                      <div className="text-xs text-muted-foreground">{asset.name}</div>
                                    )}
                                  </div>
                                </td>
                                <td className="border-r border-gray-200 dark:border-gray-700 px-3 py-2 font-mono">
                                  {asset.rawBalance.toLocaleString(undefined, {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 8,
                                  })}
                                </td>
                                <td className="border-r border-gray-200 dark:border-gray-700 px-3 py-2 font-mono">
                                  ${asset.price.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 6,
                                  })}
                                </td>
                                <td className="px-3 py-2 font-mono font-semibold">
                                  ${asset.usdValue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No asset data to display</p>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-muted rounded text-xs">
                <div className="font-medium mb-2">Summary:</div>
                <div>Total Assets: {debugData.length}</div>
                <div>Total USD Value: ${debugData.reduce((sum, asset) => sum + asset.usdValue, 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</div>
                <div className="mt-2">
                  <div className="font-medium">Token Symbols Found:</div>
                  <div className="text-xs">
                    {Array.from(new Set(debugData.map(asset => asset.symbol))).sort().join(', ')}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="font-medium">Price Data Available:</div>
                  <div className="text-xs">
                    {prices ? Object.keys(prices).sort().join(', ') : 'No price data'}
                  </div>
                  <div className="text-xs mt-1">
                    stETH price: {prices?.stETH ? `$${prices.stETH.price}` : 'Not found'} | 
                    rETH price: {prices?.rETH ? `$${prices.rETH.price}` : 'Not found'}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="font-medium">All Tokens Detected (including zero balance):</div>
                  <div className="text-xs max-h-32 overflow-y-auto">
                    {window.allTokensFound ? 
                      window.allTokensFound
                        .filter((token: TokenInfo, index: number, arr: TokenInfo[]) => 
                          arr.findIndex(t => t.symbol === token.symbol && t.chain === token.chain && t.address === token.address) === index
                        )
                        .map((token: TokenInfo) => 
                          `${token.symbol} (${token.name}) - ${token.chain} - ${token.address} - Balance: ${token.balance}`
                        ).join(' | ') 
                      : 'No tokens detected'
                    }
                  </div>
                </div>
                <div className="mt-2">
                  <div className="font-medium">ETH/rETH Related Tokens:</div>
                  <div className="text-xs">
                    {window.allTokensFound ? 
                      window.allTokensFound
                        .filter((token: TokenInfo) => 
                          token.symbol.toLowerCase().includes('eth') || 
                          token.symbol.toLowerCase().includes('rocket') ||
                          token.name.toLowerCase().includes('rocket')
                        )
                        .map((token: TokenInfo) => 
                          `${token.symbol} (${token.name}) - Balance: ${token.balance}`
                        ).join(' | ') || 'No ETH-related tokens found'
                      : 'No data'
                    }
                  </div>
                </div>
                <div className="mt-2">
                  <div className="font-medium">Data Sources:</div>
                  {Object.entries(
                    debugData.reduce((acc, asset) => {
                      acc[asset.dataSource] = (acc[asset.dataSource] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([source, count]) => (
                    <div key={source}>• {source}: {count} assets</div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

    </div>
  );
}