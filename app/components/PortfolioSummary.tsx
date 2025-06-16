import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Coins, RefreshCw, AlertTriangle } from "lucide-react";
import { Address } from "../types";
import { usePrices } from "../hooks/usePrices";
import { 
  calculatePortfolioSummary, 
  formatCurrency, 
  formatPercentage, 
  formatNumber 
} from "../lib/portfolio";

interface PortfolioSummaryProps {
  addresses: Address[];
  onPriceUpdate?: (date: Date) => void;
}

export function PortfolioSummary({ addresses, onPriceUpdate }: PortfolioSummaryProps) {
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

  const handleRefreshPrices = async () => {
    try {
      await refetchPrices();
      if (onPriceUpdate) {
        onPriceUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to refresh prices:', error);
    }
  };

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
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to fetch cryptocurrency prices. This might be due to rate limiting. 
            {pricesError instanceof Error ? ` Error: ${pricesError.message}` : ''}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshPrices}
              disabled={isFetchingPrices}
              className="ml-2"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isFetchingPrices ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Portfolio Summary
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshPrices}
              disabled={isFetchingPrices || symbols.length === 0}
              className="cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetchingPrices ? 'animate-spin' : ''}`} />
              {isFetchingPrices ? 'Updating...' : 'Refresh Prices'}
            </Button>
          </div>
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

        {/* Top Token Holdings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Token Holdings</CardTitle>
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
                          {formatNumber(token.totalBalance)} tokens
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
                  <p>No token holdings found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Native Assets */}
      {portfolioSummary.nativeAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Native Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioSummary.nativeAssets.map((asset, index) => (
                <div key={`${asset.chain}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      asset.chain === 'bitcoin' ? 'bg-orange-500' :
                      asset.chain === 'solana' ? 'bg-purple-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(asset.balance)} {asset.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(asset.usdValue)}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}