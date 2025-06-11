export interface Address {
  id: string;
  label: string;
  address: string;
  chain: string;
  balance?: number;
  lastUpdated?: Date;
  lastTransactions?: Array<{
    hash: string;
    timestamp: number;
    value: number;
    type: "sent" | "received";
  }>;
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
  { value: "zcash", label: "Zcash", symbol: "ZEC", color: "bg-yellow-500" },
];
