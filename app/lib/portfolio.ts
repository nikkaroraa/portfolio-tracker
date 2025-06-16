import { Address } from "../types";

export interface PortfolioAsset {
  symbol: string;
  balance: number;
  usdValue: number;
  percentage: number;
  chain: string;
  type: 'native' | 'token';
}

export interface ChainAllocation {
  chain: string;
  label: string;
  color: string;
  usdValue: number;
  percentage: number;
  assets: PortfolioAsset[];
}

export interface TokenHolding {
  symbol: string;
  name: string;
  totalBalance: number;
  usdValue: number;
  percentage: number;
  chains: {
    chain: string;
    balance: number;
    usdValue: number;
  }[];
}

export interface PortfolioSummary {
  totalValue: number;
  change24h: number;
  totalAssets: number;
  chainAllocations: ChainAllocation[];
  topTokens: TokenHolding[];
  nativeAssets: PortfolioAsset[];
}

function getChainSymbol(chain: string): string {
  switch (chain) {
    case 'bitcoin':
      return 'BTC';
    case 'ethereum':
    case 'arbitrum':
    case 'polygon':
    case 'optimism':
    case 'base':
      return 'ETH';
    case 'solana':
      return 'SOL';
    default:
      return '';
  }
}

function getChainInfo(chain: string) {
  const chainMap: Record<string, { label: string; color: string }> = {
    bitcoin: { label: 'Bitcoin', color: 'bg-orange-500' },
    ethereum: { label: 'Ethereum', color: 'bg-blue-500' },
    arbitrum: { label: 'Arbitrum', color: 'bg-blue-400' },
    polygon: { label: 'Polygon', color: 'bg-purple-500' },
    optimism: { label: 'Optimism', color: 'bg-red-500' },
    base: { label: 'Base', color: 'bg-blue-600' },
    solana: { label: 'Solana', color: 'bg-purple-500' },
  };
  
  return chainMap[chain] || { label: chain, color: 'bg-gray-500' };
}

export function calculatePortfolioSummary(
  addresses: Address[],
  prices: Record<string, { price: number; change24h: number }>
): PortfolioSummary {
  const assets: PortfolioAsset[] = [];
  const tokenMap = new Map<string, TokenHolding>();
  let totalValue = 0;
  let totalChange24h = 0;

  // Process each address
  addresses.forEach(address => {
    if (address.chain === 'ethereum' && address.chainData) {
      // Handle multi-chain Ethereum addresses
      address.chainData.forEach(chainData => {
        if (chainData.balance && chainData.balance > 0) {
          const symbol = getChainSymbol(chainData.chain);
          const price = prices[symbol]?.price || 0;
          const usdValue = chainData.balance * price;
          
          assets.push({
            symbol,
            balance: chainData.balance,
            usdValue,
            percentage: 0, // Will be calculated later
            chain: chainData.chain,
            type: 'native'
          });
          
          totalValue += usdValue;
          totalChange24h += usdValue * (prices[symbol]?.change24h || 0) / 100;
        }

        // Process tokens for this chain
        chainData.tokens?.forEach(token => {
          if (Number(token.balance) > 0) {
            const price = prices[token.symbol]?.price || 0;
            const balance = Number(token.balance);
            const usdValue = balance * price;
            
            totalValue += usdValue;
            totalChange24h += usdValue * (prices[token.symbol]?.change24h || 0) / 100;

            // Aggregate tokens across chains
            const existing = tokenMap.get(token.symbol);
            if (existing) {
              existing.totalBalance += balance;
              existing.usdValue += usdValue;
              existing.chains.push({
                chain: chainData.chain,
                balance,
                usdValue
              });
            } else {
              tokenMap.set(token.symbol, {
                symbol: token.symbol,
                name: token.name,
                totalBalance: balance,
                usdValue,
                percentage: 0,
                chains: [{
                  chain: chainData.chain,
                  balance,
                  usdValue
                }]
              });
            }
          }
        });
      });
    } else {
      // Handle single-chain addresses
      if (address.balance && address.balance > 0) {
        const symbol = getChainSymbol(address.chain);
        const price = prices[symbol]?.price || 0;
        const usdValue = address.balance * price;
        
        assets.push({
          symbol,
          balance: address.balance,
          usdValue,
          percentage: 0,
          chain: address.chain,
          type: 'native'
        });
        
        totalValue += usdValue;
        totalChange24h += usdValue * (prices[symbol]?.change24h || 0) / 100;
      }

      // Process tokens
      address.tokens?.forEach(token => {
        if (Number(token.balance) > 0) {
          const price = prices[token.symbol]?.price || 0;
          const balance = Number(token.balance);
          const usdValue = balance * price;
          
          totalValue += usdValue;
          totalChange24h += usdValue * (prices[token.symbol]?.change24h || 0) / 100;

          const existing = tokenMap.get(token.symbol);
          if (existing) {
            existing.totalBalance += balance;
            existing.usdValue += usdValue;
            existing.chains.push({
              chain: address.chain,
              balance,
              usdValue
            });
          } else {
            tokenMap.set(token.symbol, {
              symbol: token.symbol,
              name: token.name,
              totalBalance: balance,
              usdValue,
              percentage: 0,
              chains: [{
                chain: address.chain,
                balance,
                usdValue
              }]
            });
          }
        }
      });
    }
  });

  // Calculate percentages for assets
  assets.forEach(asset => {
    asset.percentage = totalValue > 0 ? (asset.usdValue / totalValue) * 100 : 0;
  });

  // Calculate percentages for tokens and convert to array
  const topTokens = Array.from(tokenMap.values())
    .map(token => ({
      ...token,
      percentage: totalValue > 0 ? (token.usdValue / totalValue) * 100 : 0
    }))
    .sort((a, b) => b.usdValue - a.usdValue)
    .slice(0, 10); // Top 10 tokens

  // Calculate chain allocations
  const chainMap = new Map<string, number>();
  assets.forEach(asset => {
    const current = chainMap.get(asset.chain) || 0;
    chainMap.set(asset.chain, current + asset.usdValue);
  });

  // Add token values to chain allocations
  topTokens.forEach(token => {
    token.chains.forEach(({ chain, usdValue }) => {
      const current = chainMap.get(chain) || 0;
      chainMap.set(chain, current + usdValue);
    });
  });

  const chainAllocations: ChainAllocation[] = Array.from(chainMap.entries())
    .map(([chain, usdValue]) => {
      const info = getChainInfo(chain);
      const chainAssets = assets.filter(asset => asset.chain === chain);
      
      return {
        chain,
        label: info.label,
        color: info.color,
        usdValue,
        percentage: totalValue > 0 ? (usdValue / totalValue) * 100 : 0,
        assets: chainAssets
      };
    })
    .sort((a, b) => b.usdValue - a.usdValue);

  const nativeAssets = assets.filter(asset => asset.type === 'native');

  return {
    totalValue,
    change24h: totalValue > 0 ? (totalChange24h / totalValue) * 100 : 0,
    totalAssets: assets.length + topTokens.length,
    chainAllocations,
    topTokens,
    nativeAssets
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatNumber(value: number, decimals: number = 6): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}