export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
}

export interface ChainData {
  chain: string;
  balance?: number;
  lastUpdated?: Date;
  tokens?: TokenBalance[];
  lastTransactions?: Array<{
    hash: string;
    timestamp: number;
    value: number;
    type: "sent" | "received";
    asset?: string;
  }>;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Address {
  id: string;
  label: string;
  address: string;
  chain: string;
  network?: string;
  description?: string;
  tags?: Tag[];
  balance?: number;
  lastUpdated?: Date;
  tokens?: TokenBalance[];
  lastTransactions?: Array<{
    hash: string;
    timestamp: number;
    value: number;
    type: "sent" | "received";
    asset?: string;
  }>;
  // New field for multi-chain data (only used for Ethereum addresses)
  chainData?: ChainData[];
}

export interface TransactionVout {
  value: number;
  scriptpubkey_address: string;
}

export interface TransactionVin {
  prevout: {
    value: number;
    scriptpubkey_address: string;
  };
}

export interface Transaction {
  txid: string;
  status: {
    block_time: number;
  };
  vout: TransactionVout[];
  vin: TransactionVin[];
}

export interface ChainInfo {
  value: string;
  label: string;
  symbol: string;
  color: string;
}

export const SUPPORTED_CHAINS: ChainInfo[] = [
  { value: "bitcoin", label: "Bitcoin", symbol: "BTC", color: "bg-orange-500" },
  { value: "ethereum", label: "Ethereum", symbol: "ETH", color: "bg-blue-500" },
  { value: "solana", label: "Solana", symbol: "SOL", color: "bg-purple-500" },
];

export const SUPPORTED_ETHEREUM_NETWORKS = [
  { value: "mainnet", label: "Ethereum Mainnet" },
  { value: "arbitrum", label: "Arbitrum One" },
  { value: "polygon", label: "Polygon" },
  { value: "optimism", label: "Optimism" },
  { value: "base", label: "Base" },
];

export const SUPPORTED_TOKENS = [
  "WETH",
  "WSTETH",
  "stETH",
  "rETH",
  "RETH",
  "USDC",
  "USDT",
  "EUL",
  "PENDLE",
  "INST",
  "WBTC",
  "DAI",
  "LINK",
  "UNI",
  "AAVE",
  "CRV",
  "COMP",
  "MKR",
  "SNX",
  "1INCH",
  "POL",
];

export const SUPPORTED_SPL_TOKENS: Record<
  string,
  { symbol: string; name: string }
> = {
  // Popular SPL tokens by mint address
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    symbol: "USDC",
    name: "USD Coin",
  },
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
    symbol: "USDT",
    name: "Tether USD",
  },
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": {
    symbol: "WETH",
    name: "Wrapped Ethereum",
  },
  "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh": {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
  },
  So11111111111111111111111111111111111111112: {
    symbol: "SOL",
    name: "Wrapped SOL",
  },
  mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: {
    symbol: "mSOL",
    name: "Marinade SOL",
  },
  "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": {
    symbol: "stSOL",
    name: "Lido Staked SOL",
  },
  bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1: {
    symbol: "bSOL",
    name: "BlazeStake SOL",
  },
  J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn: {
    symbol: "JitoSOL",
    name: "Jito Staked SOL",
  },
  cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij: {
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
  },
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: {
    symbol: "JUP",
    name: "Jupiter",
  },
  DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ: {
    symbol: "DUST",
    name: "DUST Protocol",
  },
  HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3: {
    symbol: "PYTH",
    name: "Pyth Network",
  },
  "7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx": {
    symbol: "GMT",
    name: "STEPN",
  },
  orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE: { symbol: "ORCA", name: "Orca" },
  "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E": {
    symbol: "BTC",
    name: "Bitcoin (Portal)",
  },
  A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM: {
    symbol: "USDCet",
    name: "USD Coin (Portal from Ethereum)",
  },
  Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1: { symbol: "SBR", name: "Saber" },
};

export const SUPPORTED_SPL_TOKEN_SYMBOLS = Object.values(
  SUPPORTED_SPL_TOKENS
).map((token) => token.symbol);
