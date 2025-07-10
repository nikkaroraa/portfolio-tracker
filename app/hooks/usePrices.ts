import { useQuery } from "@tanstack/react-query";

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
}

async function fetchPrices(symbols: string[]): Promise<Record<string, PriceData>> {
  if (symbols.length === 0) {
    return {};
  }

  const response = await fetch(`/api/prices?symbols=${symbols.join(',')}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error(errorData.error || 'Rate limit exceeded. Please wait a moment before refreshing prices again.');
    } else if (response.status >= 500) {
      throw new Error(errorData.error || 'CoinGecko service is temporarily unavailable. Please try again later.');
    } else {
      throw new Error(errorData.error || `Failed to fetch prices (${response.status})`);
    }
  }

  const data = await response.json();
  
  // Debug logs for POL token price specifically
  if (symbols.includes('POL') && data.POL) {
    console.log("💲 POL Price Data:", {
      symbol: 'POL',
      price: data.POL.price,
      change24h: data.POL.change24h,
      requestedSymbols: symbols,
      allPrices: data
    });
  }
  
  return data;
}

export function usePrices(symbols: string[]) {
  return useQuery({
    queryKey: ['prices', symbols.sort()],
    queryFn: () => fetchPrices(symbols),
    enabled: symbols.length > 0,
    staleTime: 300000, // 5 minutes - longer to respect rate limits
    refetchInterval: false, // Don't auto-refetch to avoid rate limits
    retry: (failureCount, error) => {
      // Don't retry on rate limit errors
      if (error instanceof Error && error.message.includes('Rate limit')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

export function usePrice(symbol: string) {
  const { data, ...rest } = usePrices([symbol]);
  
  return {
    ...rest,
    data: data?.[symbol],
  };
}