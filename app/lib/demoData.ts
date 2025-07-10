import { Address } from "../types";

// Famous crypto addresses for demo purposes
export const DEMO_ADDRESSES: Omit<Address, 'id' | 'lastUpdated'>[] = [
  {
    name: "Vitalik Buterin",
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    chain: "ethereum",
    network: "mainnet",
    description: "Ethereum founder's known wallet",
    tags: [{ id: "founder", name: "Founder", color: "#6366f1", createdAt: new Date('2024-01-01') }],
    balance: 1234.56,
    tokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        balance: "500000.50",
        contractAddress: "0xA0b86a33E6441e2C0134C2ee2F5bb44A31a7E4e8",
        decimals: 6
      },
      {
        symbol: "UNI",
        name: "Uniswap",
        balance: "25000.00",
        contractAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        decimals: 18
      }
    ],
    lastTransactions: [
      {
        hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        type: "sent",
        value: 0.5,
        timestamp: Date.now() - 2 * 60 * 60 * 1000 // 2 hours ago
      },
      {
        hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        type: "received",
        value: 2.1,
        timestamp: Date.now() - 5 * 60 * 60 * 1000 // 5 hours ago
      }
    ],
    chainData: [
      {
        chain: "ethereum",
        balance: 1234.56,
        tokens: [
          {
            symbol: "USDC",
            name: "USD Coin",
            balance: "500000.50",
            contractAddress: "0xA0b86a33E6441e2C0134C2ee2F5bb44A31a7E4e8",
            decimals: 6
          }
        ],
        lastTransactions: []
      },
      {
        chain: "arbitrum",
        balance: 45.23,
        tokens: [
          {
            symbol: "ARB",
            name: "Arbitrum",
            balance: "1000.00",
            contractAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
            decimals: 18
          }
        ],
        lastTransactions: []
      }
    ]
  },
  {
    name: "Coinbase CEO",
    address: "0x503828976D22510aad0201ac7EC88293211D23Da",
    chain: "ethereum",
    network: "mainnet",
    description: "Brian Armstrong's known address",
    tags: [{ id: "ceo", name: "CEO", color: "#f59e0b", createdAt: new Date('2024-01-01') }],
    balance: 567.89,
    tokens: [
      {
        symbol: "WBTC",
        name: "Wrapped Bitcoin",
        balance: "10.50",
        contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        decimals: 8
      }
    ],
    lastTransactions: []
  },
  {
    name: "Satoshi Era Wallet",
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    chain: "bitcoin",
    network: "mainnet",
    description: "Genesis block reward address",
    tags: [{ id: "historic", name: "Historic", color: "#f97316", createdAt: new Date('2024-01-01') }],
    balance: 68.34,
    lastTransactions: [
      {
        hash: "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
        type: "received",
        value: 50.0,
        timestamp: new Date('2009-01-03T18:15:05.000Z').getTime()
      }
    ]
  },
  {
    name: "DeFi Whale",
    address: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
    chain: "ethereum",
    network: "mainnet",
    description: "Large DeFi investor",
    tags: [{ id: "whale", name: "Whale", color: "#06b6d4", createdAt: new Date('2024-01-01') }],
    balance: 2567.12,
    tokens: [
      {
        symbol: "AAVE",
        name: "Aave",
        balance: "5000.00",
        contractAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
        decimals: 18
      },
      {
        symbol: "COMP",
        name: "Compound",
        balance: "1500.00",
        contractAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        decimals: 18
      }
    ],
    lastTransactions: []
  }
];

export const DEMO_MODE_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  password: 'demo123',
  apiDelay: 1000, // Simulate API delay
  errorRate: 0.1, // 10% chance of simulated errors
};

export function isDemoMode(): boolean {
  return DEMO_MODE_CONFIG.enabled || !process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
}

export function getDemoAddresses(): Address[] {
  return DEMO_ADDRESSES.map((addr, index) => ({
    ...addr,
    id: `demo-${index}`,
    lastUpdated: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24h
  }));
}

// Mock API responses for demo mode
export async function mockApiCall<T>(data: T, delay = DEMO_MODE_CONFIG.apiDelay): Promise<T> {
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Simulate occasional errors
  if (Math.random() < DEMO_MODE_CONFIG.errorRate) {
    throw new Error('Demo API: Rate limit exceeded. This is a simulated error.');
  }
  
  return data;
}