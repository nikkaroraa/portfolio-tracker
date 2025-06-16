import { useQuery } from "@tanstack/react-query";

interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum", 
  SOL: "solana",
  USDC: "usd-coin",
  USDT: "tether",
  WETH: "weth",
  WBTC: "wrapped-bitcoin",
  DAI: "dai",
  LINK: "chainlink",
  UNI: "uniswap",
  AAVE: "aave",
  CRV: "curve-dao-token",
  COMP: "compound-token",
  MKR: "maker",
  SNX: "havven",
  "1INCH": "1inch",
  WSTETH: "wrapped-steth",
  STETH: "lido-staked-ether",
  EUL: "euler",
  PENDLE: "pendle",
  INST: "instadapp",
  // Solana tokens
  MSOL: "marinade",
  STSOL: "lido-staked-sol",
  BSOL: "blazestake-staked-sol",
  JITOSOL: "jito-staked-sol",
  CBBTN: "coinbase-wrapped-btc",
  JUP: "jupiter-exchange-solana",
  DUST: "dust-protocol",
  PYTH: "pyth-network",
  GMT: "stepn",
  ORCA: "orca",
  USDCET: "usd-coin-ethereum-bridged",
  SBR: "saber",
};

async function fetchPrices(symbols: string[]): Promise<Record<string, PriceData>> {
  const coinGeckoIds = symbols
    .map(symbol => COINGECKO_IDS[symbol])
    .filter(Boolean);
    
  if (coinGeckoIds.length === 0) {
    return {};
  }

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=usd&include_24hr_change=true`,
    {
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment before refreshing prices again.');
    } else if (response.status >= 500) {
      throw new Error('CoinGecko service is temporarily unavailable. Please try again later.');
    } else {
      throw new Error(`Failed to fetch prices (${response.status})`);
    }
  }

  const data: CoinGeckoPrice = await response.json();
  
  const result: Record<string, PriceData> = {};
  
  // Map the data back to symbols
  symbols.forEach(symbol => {
    const coinGeckoId = COINGECKO_IDS[symbol];
    if (coinGeckoId && data[coinGeckoId]) {
      result[symbol] = {
        symbol,
        price: data[coinGeckoId].usd,
        change24h: data[coinGeckoId].usd_24h_change || 0,
      };
    }
  });

  return result;
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