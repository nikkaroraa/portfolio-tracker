"use client";

import { useQuery } from "@tanstack/react-query";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";

function getSolanaConnection() {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is required for Solana");
  }
  const rpcUrl = `https://solana-mainnet.g.alchemy.com/v2/${apiKey}`;
  console.log("Solana RPC URL:", rpcUrl.replace(apiKey, "***"));
  return new Connection(rpcUrl, "confirmed");
}

interface SolanaTransaction {
  hash: string; // Using hash for consistency with other chains
  timestamp: number;
  value: number;
  type: "sent" | "received";
  asset?: string;
}

interface SolanaTokenBalance {
  contractAddress: string; // Using mint as contract address for consistency
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
}

function normalizeSOLAddress(address: string): PublicKey {
  const cleanAddress = address.trim();
  
  // Basic Solana address validation (base58, typically 44 characters)
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cleanAddress)) {
    throw new Error("Invalid Solana address format");
  }
  
  // Validate base58 decoding
  try {
    const decoded = bs58.decode(cleanAddress);
    if (decoded.length !== 32) {
      throw new Error("Solana address must be 32 bytes when decoded");
    }
  } catch (error) {
    throw new Error(`Invalid base58 encoding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Try to create a PublicKey
  try {
    return new PublicKey(cleanAddress);
  } catch (error) {
    console.error("PublicKey creation failed:", error);
    throw new Error(`Invalid Solana public key format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function fetchSolanaBalance(address: string) {
  console.log("Fetching Solana balance for address:", address);
  
  try {
    const publicKey = normalizeSOLAddress(address);
    console.log("Created PublicKey successfully:", publicKey.toBase58());
    
    const connection = getSolanaConnection();

    // Get SOL balance
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    const formattedSolBalance = Number(solBalance.toFixed(6));

    // Skip token accounts for now due to PublicKey constructor issues
    const tokenBalances: SolanaTokenBalance[] = [];
    console.log("Skipping token accounts due to library compatibility issues");

    // Get recent signatures/transactions
    console.log("Fetching transaction signatures for:", publicKey.toBase58());
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: 10,
    });

    console.log("Found", signatures.length, "signatures");

    // Process transactions to get transaction details
    const recentTransactions: SolanaTransaction[] = [];
    
    for (const sig of signatures.slice(0, 5)) {
      try {
        console.log("Processing signature:", sig.signature);
        
        const transaction = await connection.getTransaction(sig.signature, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });
        
        if (transaction && transaction.meta && !transaction.meta.err) {
          console.log("Transaction found, processing...");
          const preBalances = transaction.meta.preBalances;
          const postBalances = transaction.meta.postBalances;
          
          // Handle both legacy and versioned transactions
          let accountKeys;
          if (transaction.transaction.message.accountKeys) {
            // Legacy transaction
            accountKeys = transaction.transaction.message.accountKeys;
          } else if (transaction.transaction.message.staticAccountKeys) {
            // Versioned transaction
            accountKeys = transaction.transaction.message.staticAccountKeys;
          } else {
            console.warn("Could not find account keys in transaction");
            continue;
          }
          
          console.log("Account keys found:", accountKeys.length);
          
          // Find our address in the account keys
          const addressIndex = accountKeys.findIndex(key => key.toBase58() === publicKey.toBase58());
          console.log("Address index:", addressIndex);
          
          if (addressIndex !== -1) {
            const preBalance = preBalances[addressIndex] || 0;
            const postBalance = postBalances[addressIndex] || 0;
            const balanceChange = (postBalance - preBalance) / LAMPORTS_PER_SOL;
            
            console.log("Balance change:", {
              preBalance,
              postBalance, 
              balanceChange,
              timestamp: sig.blockTime
            });
            
            // Calculate the actual transaction value
            // For Solana, balance change includes fees, so let's try to get a better estimate
            let transactionValue = Math.abs(balanceChange);
            let transactionType: "sent" | "received" = balanceChange > 0 ? "received" : "sent";
            
            // If balance change is very small, it might just be fees
            // In that case, try to extract value from transaction fee
            if (Math.abs(balanceChange) < 0.001) {
              const fee = transaction.meta.fee ? transaction.meta.fee / LAMPORTS_PER_SOL : 0;
              transactionValue = fee > 0 ? fee : 0.000005; // Default small fee amount
              transactionType = "sent"; // Fees are always outgoing
            }
            
            console.log("Final transaction value:", transactionValue, "type:", transactionType);
            
            // Only include transactions with meaningful amounts or fees
            if (transactionValue > 0.000001) {
              recentTransactions.push({
                hash: sig.signature,
                timestamp: (sig.blockTime || Date.now() / 1000) * 1000, // Convert to milliseconds
                value: transactionValue,
                type: transactionType,
                asset: "SOL",
              });
            } else {
              console.log("Transaction value too small, skipping");
            }
          } else {
            console.log("Address not found in account keys");
          }
        } else {
          console.log("Transaction not found or has error");
        }
      } catch (error) {
        console.warn("Failed to fetch transaction details for signature:", sig.signature, error);
      }
    }
    
    console.log("Final recent transactions:", recentTransactions);

    return {
      balance: formattedSolBalance,
      tokens: tokenBalances,
      lastTransactions: recentTransactions,
    };
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      address: address,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export function useSolanaBalance(address: string) {
  return useQuery({
    queryKey: ["solanaBalance", address],
    queryFn: () => fetchSolanaBalance(address),
    enabled: false, // Don't fetch automatically
  });
}