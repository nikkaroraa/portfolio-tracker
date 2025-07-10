import { useQuery } from "@tanstack/react-query";
import { Transaction } from "../types";

async function fetchBitcoinBalance(address: string) {
  const response = await fetch(`https://mempool.space/api/address/${address}`);
  
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment before refreshing again.");
    } else if (response.status === 404) {
      throw new Error("Bitcoin address not found. Please check the address format.");
    } else if (response.status >= 500) {
      throw new Error("Mempool.space service is temporarily unavailable. Please try again later.");
    }
    throw new Error(`Failed to fetch Bitcoin balance (${response.status})`);
  }
  
  const data = await response.json();

  // Get the recent transactions
  const transactionsResponse = await fetch(
    `https://mempool.space/api/address/${address}/txs`
  );
  
  if (!transactionsResponse.ok) {
    if (transactionsResponse.status === 429) {
      throw new Error("Rate limit exceeded while fetching transactions. Please wait before trying again.");
    }
    // Don't fail completely if transactions fail, just return empty array
    console.warn("Failed to fetch Bitcoin transactions:", transactionsResponse.status);
    return {
      balance: data.chain_stats.funded_txo_sum / 100000000,
      lastTransactions: [],
    };
  }
  
  const transactions = (await transactionsResponse.json()) as Transaction[];

  // Process the last 5 transactions
  const recentTransactions = transactions.slice(0, 5).map((tx) => {
    // Check if our address is in inputs (sent) or outputs (received)
    const isInInputs = tx.vin.some(
      (input) => input.prevout.scriptpubkey_address === address
    );
    const isInOutputs = tx.vout.some(
      (output) => output.scriptpubkey_address === address
    );

    // Calculate the value for this address
    let value = 0;
    if (isInInputs) {
      // If sent, sum up all outputs that aren't to our address
      value = tx.vout
        .filter((output) => output.scriptpubkey_address !== address)
        .reduce((sum, output) => sum + output.value, 0);
    } else if (isInOutputs) {
      // If received, sum up all outputs to our address
      value = tx.vout
        .filter((output) => output.scriptpubkey_address === address)
        .reduce((sum, output) => sum + output.value, 0);
    }

    const type: "sent" | "received" = isInInputs ? "sent" : "received";

    return {
      hash: tx.txid,
      timestamp: tx.status.block_time,
      value: value / 100000000, // Convert satoshis to BTC
      type,
    };
  });

  return {
    balance: data.chain_stats.funded_txo_sum / 100000000,
    lastTransactions: recentTransactions,
  };
}

export function useBitcoinBalance(address: string) {
  return useQuery({
    queryKey: ["bitcoinBalance", address],
    queryFn: () => fetchBitcoinBalance(address),
    enabled: false, // Don't fetch automatically
  });
}
