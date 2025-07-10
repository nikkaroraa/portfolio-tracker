"use client";

import { useQuery } from "@tanstack/react-query";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SUPPORTED_SPL_TOKENS } from "../types";
import bs58 from "bs58";

function getSolanaConnection() {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error("Alchemy API key is missing. Please check your environment configuration.");
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
  try {
    const publicKey = normalizeSOLAddress(address);
    const connection = getSolanaConnection();

    // Get SOL balance
    let balance;
    try {
      balance = await connection.getBalance(publicKey);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('rate')) {
          throw new Error("Rate limit exceeded for Solana. Please wait before refreshing again.");
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          throw new Error("Network error while fetching Solana data. Please check your connection.");
        }
      }
      throw new Error("Failed to fetch Solana balance. Please try again later.");
    }
    
    const solBalance = balance / LAMPORTS_PER_SOL;
    const formattedSolBalance = Number(solBalance.toFixed(6));

    // Get SPL token balances
    const tokenBalances: SolanaTokenBalance[] = [];
    
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      for (const account of tokenAccounts.value) {
        try {
          const tokenInfo = account.account.data.parsed.info;
          const tokenAmount = Number(tokenInfo.tokenAmount.amount);
          const decimals = tokenInfo.tokenAmount.decimals;
          const mintAddress = tokenInfo.mint;
          
          console.log("Processing token:", {
            mint: mintAddress,
            amount: tokenAmount,
            isSupported: !!SUPPORTED_SPL_TOKENS[mintAddress],
            hasBalance: tokenAmount > 0
          });
          
          // Only include tokens with non-zero balances and supported tokens
          if (tokenAmount > 0 && SUPPORTED_SPL_TOKENS[mintAddress]) {
            const tokenData = SUPPORTED_SPL_TOKENS[mintAddress];
            const formattedBalance = tokenAmount / Math.pow(10, decimals);
            
            console.log("Adding supported token:", tokenData.symbol, formattedBalance);
            
            tokenBalances.push({
              contractAddress: mintAddress,
              symbol: tokenData.symbol,
              name: tokenData.name,
              balance: formattedBalance.toString(),
              decimals,
            });
          } else if (tokenAmount > 0) {
            console.log("Token not in supported list:", mintAddress);
          }
        } catch (error) {
          console.warn("Failed to process SPL token account:", account.pubkey, error);
        }
      }
      
      console.log("Final filtered tokens:", tokenBalances);
    } catch (error) {
      console.warn("Failed to fetch SPL token accounts:", error);
    }

    // Get recent transaction history
    const recentTransactions: SolanaTransaction[] = [];
    
    try {
      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: 10,
      });

      for (const sig of signatures.slice(0, 5)) {
        try {
          const transaction = await connection.getTransaction(sig.signature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
          });
          
          if (transaction && transaction.meta && !transaction.meta.err) {
            const preBalances = transaction.meta.preBalances;
            const postBalances = transaction.meta.postBalances;
            
            // Handle both legacy and versioned transactions
            let accountKeys;
            const message = transaction.transaction.message;
            
            if ('accountKeys' in message) {
              // Legacy transaction
              accountKeys = message.accountKeys;
            } else {
              // Versioned transaction - get account keys from meta
              accountKeys = transaction.meta.loadedAddresses ? 
                [...transaction.transaction.message.staticAccountKeys, ...transaction.meta.loadedAddresses.writable, ...transaction.meta.loadedAddresses.readonly] :
                transaction.transaction.message.staticAccountKeys;
            }
            
            const addressIndex = accountKeys.findIndex(key => key.toBase58() === publicKey.toBase58());
            
            if (addressIndex !== -1) {
              const preBalance = preBalances[addressIndex] || 0;
              const postBalance = postBalances[addressIndex] || 0;
              const balanceChange = (postBalance - preBalance) / LAMPORTS_PER_SOL;
              
              let transactionValue = Math.abs(balanceChange);
              let transactionType: "sent" | "received" = balanceChange > 0 ? "received" : "sent";
              
              // Handle small balance changes (likely fees)
              if (Math.abs(balanceChange) < 0.001) {
                const fee = transaction.meta.fee ? transaction.meta.fee / LAMPORTS_PER_SOL : 0;
                transactionValue = fee > 0 ? fee : 0.000005;
                transactionType = "sent";
              }
              
              if (transactionValue > 0.000001) {
                recentTransactions.push({
                  hash: sig.signature,
                  timestamp: (sig.blockTime || Date.now() / 1000) * 1000,
                  value: transactionValue,
                  type: transactionType,
                  asset: "SOL",
                });
              }
            }
          }
        } catch (error) {
          console.warn("Failed to fetch transaction details for signature:", sig.signature, error);
        }
      }
    } catch (error) {
      console.warn("Failed to fetch transaction signatures:", error);
    }

    return {
      balance: formattedSolBalance,
      tokens: tokenBalances,
      lastTransactions: recentTransactions,
    };
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    
    // Provide more user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('Rate limit')) {
        throw error; // Already formatted
      } else if (error.message.includes('Invalid') || error.message.includes('address')) {
        throw new Error("Invalid Solana address format. Please check the address.");
      } else if (error.message.includes('Network')) {
        throw error; // Already formatted
      } else if (error.message.includes('Alchemy API key')) {
        throw error; // Already formatted
      }
    }
    
    throw new Error("Failed to fetch Solana balance. Please try again later.");
  }
}

export function useSolanaBalance(address: string) {
  return useQuery({
    queryKey: ["solanaBalance", address],
    queryFn: () => fetchSolanaBalance(address),
    enabled: false, // Don't fetch automatically
  });
}