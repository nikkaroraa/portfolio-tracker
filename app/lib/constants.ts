// Timeout constants
export const TIMEOUTS = {
  REFRESH_DELAY: 3000,
  THEME_STORAGE_DELAY: 100,
} as const;

// UI Configuration
export const UI_LIMITS = {
  TOP_TOKENS_DISPLAY: 5,
  PAGINATION_LIMIT: 10,
  MAX_TRANSACTIONS: 10,
} as const;

// Default colors for tags
export const TAG_COLORS = [
  'bg-blue-500',
  'bg-green-500', 
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-lime-500',
] as const;

// Chain symbols mapping
export const CHAIN_SYMBOLS = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  arbitrum: 'ETH', 
  optimism: 'ETH',
  base: 'ETH',
  polygon: 'MATIC',
  solana: 'SOL',
} as const;

// Chain display information
export const CHAIN_INFO = {
  bitcoin: { label: 'Bitcoin', color: 'bg-orange-500' },
  ethereum: { label: 'Ethereum', color: 'bg-blue-500' },
  arbitrum: { label: 'Arbitrum', color: 'bg-blue-400' },
  optimism: { label: 'Optimism', color: 'bg-red-500' },
  base: { label: 'Base', color: 'bg-blue-600' },
  polygon: { label: 'Polygon', color: 'bg-purple-500' },
  solana: { label: 'Solana', color: 'bg-purple-600' },
} as const;

export type ChainType = keyof typeof CHAIN_SYMBOLS;