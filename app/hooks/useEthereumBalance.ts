import { useQuery } from "@tanstack/react-query";
import { Network, Alchemy, AssetTransfersCategory } from "alchemy-sdk";
import { ChainData, SUPPORTED_TOKENS } from "../types";

const networkMap: Record<string, Network> = {
  ethereum: Network.ETH_MAINNET,
  arbitrum: Network.ARB_MAINNET,
  polygon: Network.MATIC_MAINNET,
  optimism: Network.OPT_MAINNET,
  base: Network.BASE_MAINNET,
  // Starknet is not supported by Alchemy SDK as of now
};

const ETHEREUM_CHAINS = ["ethereum", "arbitrum", "polygon", "optimism", "base"];

function getAlchemyInstance(chain: string) {
  const network = networkMap[chain] || Network.ETH_MAINNET;
  return new Alchemy({
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network,
  });
}

interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
}

function normalizeAddress(address: string): string {
  const cleanAddress = address.trim();
  
  // Check if it's a Bitcoin address (starts with 1, 3, or bc1)
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(cleanAddress) || 
      /^bc1[a-z0-9]{39,59}$/.test(cleanAddress)) {
    throw new Error("Bitcoin addresses cannot be used with Ethereum networks");
  }
  
  // Normalize Ethereum address
  const lowerAddress = cleanAddress.toLowerCase();
  return lowerAddress.startsWith("0x") ? lowerAddress : `0x${lowerAddress}`;
}

async function fetchEthereumBalance(address: string, chain: string) {
  const normalizedAddress = normalizeAddress(address);
  const alchemy = getAlchemyInstance(chain);

  try {
    // Get ETH balance
    const balance = await alchemy.core.getBalance(normalizedAddress, "latest");
    const ethBalance = Number(balance) / 1e18;
    const formattedEthBalance = Number(ethBalance.toFixed(6));

    // Get token balances
    const tokenBalances = await alchemy.core.getTokenBalances(
      normalizedAddress
    );
    const tokenMetadata = await Promise.all(
      tokenBalances.tokenBalances.map(async (token) => {
        if (token.tokenBalance === "0") return null;
        const metadata = await alchemy.core.getTokenMetadata(
          token.contractAddress
        );
        const tokenBalance =
          Number(token.tokenBalance || "0") /
          Math.pow(10, metadata.decimals || 18);
        const formattedTokenBalance = Number(tokenBalance.toFixed(6));
        return {
          contractAddress: token.contractAddress,
          symbol: metadata.symbol || "UNKNOWN",
          name: metadata.name || "Unknown Token",
          balance: formattedTokenBalance.toString(),
          decimals: metadata.decimals || 18,
        };
      })
    );

    // Get recent transfers (both incoming and outgoing)
    const [sentTransfers, receivedTransfers] = await Promise.all([
      alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        toBlock: "latest",
        fromAddress: normalizedAddress,
        category: [
          AssetTransfersCategory.EXTERNAL,
          AssetTransfersCategory.ERC20,
          AssetTransfersCategory.ERC721,
          AssetTransfersCategory.ERC1155,
        ],
        maxCount: 5,
      }),
      alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        toBlock: "latest",
        toAddress: normalizedAddress,
        category: [
          AssetTransfersCategory.EXTERNAL,
          AssetTransfersCategory.ERC20,
          AssetTransfersCategory.ERC721,
          AssetTransfersCategory.ERC1155,
        ],
        maxCount: 5,
      }),
    ]);

    // Combine and sort all transfers by block number (most recent first)
    const allTransfers = [
      ...sentTransfers.transfers.map((transfer) => ({
        ...transfer,
        type: "sent" as const,
      })),
      ...receivedTransfers.transfers.map((transfer) => ({
        ...transfer,
        type: "received" as const,
      })),
    ]
      .sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16))
      .slice(0, 5);

    // Get block details for timestamps
    const uniqueBlockNums = [...new Set(allTransfers.map(t => t.blockNum))];
    const blockDetails = await Promise.all(
      uniqueBlockNums.map(blockNum => 
        alchemy.core.getBlock(parseInt(blockNum, 16))
      )
    );
    
    const blockTimestamps = new Map();
    blockDetails.forEach(block => {
      if (block) {
        blockTimestamps.set(block.number, block.timestamp * 1000); // Convert to milliseconds
      }
    });

    const recentTransactions = allTransfers.map((transfer) => ({
      hash: transfer.hash,
      timestamp: blockTimestamps.get(parseInt(transfer.blockNum, 16)) || Date.now(),
      value: Number(transfer.value || 0),
      type: transfer.type,
      asset: transfer.asset || "ETH",
      from: transfer.from,
      to: transfer.to || normalizedAddress,
    }));

    const filteredTokens = tokenMetadata
      .filter((token): token is TokenBalance => token !== null)
      .filter((token) => SUPPORTED_TOKENS.includes(token.symbol))
      .filter((token) => Number(token.balance) > 0);

    return {
      balance: formattedEthBalance,
      tokens: filteredTokens,
      lastTransactions: recentTransactions,
    };
  } catch (error) {
    console.error("Error fetching Ethereum balance:", error);
    throw error;
  }
}

async function fetchAllEthereumChains(address: string): Promise<ChainData[]> {
  const chainPromises = ETHEREUM_CHAINS.map(async (chain) => {
    try {
      const data = await fetchEthereumBalance(address, chain);
      return {
        chain,
        balance: data.balance,
        tokens: data.tokens,
        lastTransactions: data.lastTransactions,
        lastUpdated: new Date(),
      } as ChainData;
    } catch (error) {
      console.error(`Error fetching data for ${chain}:`, error);
      return {
        chain,
        balance: 0,
        tokens: [],
        lastTransactions: [],
        lastUpdated: new Date(),
      } as ChainData;
    }
  });

  return Promise.all(chainPromises);
}

export function useEthereumBalance(address: string, chain: string) {
  return useQuery({
    queryKey: ["ethereumBalance", address, chain],
    queryFn: () => fetchEthereumBalance(address, chain),
    enabled: false, // Don't fetch automatically
  });
}

export function useAllEthereumChains(address: string) {
  return useQuery({
    queryKey: ["allEthereumChains", address],
    queryFn: () => fetchAllEthereumChains(address),
    enabled: false, // Don't fetch automatically
    staleTime: 30000, // 30 seconds
  });
}
