import { NextRequest, NextResponse } from 'next/server';

interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum", 
  POL: "polygon-ecosystem-token",
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
  stETH: "staked-ether",
  RETH: "rocket-pool-eth",
  EUL: "euler",
  PENDLE: "pendle",
  INST: "instadapp",
  // Solana tokens
  mSOL: "msol",
  stSOL: "lido-staked-sol",
  bSOL: "blazestake-staked-sol",
  jitoSOL: "jito-staked-sol",
  cbBTC: "coinbase-wrapped-btc",
  JUP: "jupiter-exchange-solana",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    
    if (!symbolsParam) {
      return NextResponse.json(
        { error: 'Missing symbols parameter' },
        { status: 400 }
      );
    }

    const symbols = symbolsParam.split(',');
    const coinGeckoIds = symbols
      .map(symbol => COINGECKO_IDS[symbol.trim()])
      .filter(Boolean);
      
    if (coinGeckoIds.length === 0) {
      return NextResponse.json({});
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Portfolio-Tracker/1.0',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait a moment before refreshing prices again.' },
          { status: 429 }
        );
      } else if (response.status >= 500) {
        return NextResponse.json(
          { error: 'CoinGecko service is temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      } else {
        return NextResponse.json(
          { error: `Failed to fetch prices (${response.status})` },
          { status: response.status }
        );
      }
    }

    const data: CoinGeckoPrice = await response.json();
    
    const result: Record<string, { symbol: string; price: number; change24h: number }> = {};
    
    // Map the data back to symbols
    symbols.forEach(symbol => {
      const coinGeckoId = COINGECKO_IDS[symbol.trim()];
      if (coinGeckoId && data[coinGeckoId]) {
        result[symbol] = {
          symbol,
          price: data[coinGeckoId].usd,
          change24h: data[coinGeckoId].usd_24h_change || 0,
        };
      }
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}