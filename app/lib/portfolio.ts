import { Address } from "../types";
import { CHAIN_SYMBOLS, CHAIN_INFO, ChainType } from "./constants";

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
  return CHAIN_SYMBOLS[chain as ChainType] || '';
}

function getChainInfo(chain: string) {
  return CHAIN_INFO[chain as ChainType] || { label: chain, color: 'bg-gray-500' };
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

          // Add native asset to token map as well
          const existing = tokenMap.get(symbol);
          if (existing) {
            existing.totalBalance += chainData.balance;
            existing.usdValue += usdValue;
            existing.chains.push({
              chain: chainData.chain,
              balance: chainData.balance,
              usdValue
            });
          } else {
            tokenMap.set(symbol, {
              symbol,
              name: getChainInfo(chainData.chain).label,
              totalBalance: chainData.balance,
              usdValue,
              percentage: 0,
              chains: [{
                chain: chainData.chain,
                balance: chainData.balance,
                usdValue
              }]
            });
          }
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

        // Add native asset to token map as well
        const existing = tokenMap.get(symbol);
        if (existing) {
          existing.totalBalance += address.balance;
          existing.usdValue += usdValue;
          existing.chains.push({
            chain: address.chain,
            balance: address.balance,
            usdValue
          });
        } else {
          tokenMap.set(symbol, {
            symbol,
            name: getChainInfo(address.chain).label,
            totalBalance: address.balance,
            usdValue,
            percentage: 0,
            chains: [{
              chain: address.chain,
              balance: address.balance,
              usdValue
            }]
          });
        }
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
    .slice(0, 10); // Top 10 holdings (including native assets)

  // Calculate chain allocations by aggregating all USD values by chain
  const chainMap = new Map<string, number>();
  
  // Add native asset values to chain allocations
  assets.forEach(asset => {
    const current = chainMap.get(asset.chain) || 0;
    chainMap.set(asset.chain, current + asset.usdValue);
  });

  // Add token values to chain allocations (avoiding double-counting native assets)
  addresses.forEach(address => {
    if (address.chain === 'ethereum' && address.chainData) {
      address.chainData.forEach(chainData => {
        chainData.tokens?.forEach(token => {
          if (Number(token.balance) > 0) {
            const price = prices[token.symbol]?.price || 0;
            const balance = Number(token.balance);
            const usdValue = balance * price;
            
            const current = chainMap.get(chainData.chain) || 0;
            chainMap.set(chainData.chain, current + usdValue);
          }
        });
      });
    } else {
      address.tokens?.forEach(token => {
        if (Number(token.balance) > 0) {
          const price = prices[token.symbol]?.price || 0;
          const balance = Number(token.balance);
          const usdValue = balance * price;
          
          const current = chainMap.get(address.chain) || 0;
          chainMap.set(address.chain, current + usdValue);
        }
      });
    }
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