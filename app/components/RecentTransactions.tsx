import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Address } from "../types";
import { CHAIN_SYMBOLS } from "../lib/constants";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getExplorerUrl(chain: string, txHash: string): string {
  switch (chain) {
    case "ethereum":
      return `https://etherscan.io/tx/${txHash}`;
    case "arbitrum":
      return `https://arbiscan.io/tx/${txHash}`;
    case "polygon":
      return `https://polygonscan.com/tx/${txHash}`;
    case "optimism":
      return `https://optimistic.etherscan.io/tx/${txHash}`;
    case "base":
      return `https://basescan.org/tx/${txHash}`;
    case "solana":
      return `https://solscan.io/tx/${txHash}`;
    case "bitcoin":
      return `https://mempool.space/tx/${txHash}`;
    default:
      return "#";
  }
}

interface TransactionWithContext {
  tx: any;
  chain: string;
  walletName: string;
  walletAddress: string;
}

interface RecentTransactionsProps {
  addresses: Address[];
  maxTransactions?: number;
}

export function RecentTransactions({ addresses, maxTransactions = 20 }: RecentTransactionsProps) {
  const allTransactions = React.useMemo(() => {
    const transactions: TransactionWithContext[] = [];
    
    addresses.forEach(address => {
      // For ethereum addresses with chainData
      if (address.chain === 'ethereum' && address.chainData) {
        address.chainData.forEach(chainData => {
          if (chainData.lastTransactions) {
            chainData.lastTransactions.forEach(tx => {
              transactions.push({
                tx,
                chain: chainData.chain,
                walletName: address.name || 'Unnamed Wallet',
                walletAddress: address.address
              });
            });
          }
        });
      } else if (address.lastTransactions) {
        // For other chains (Bitcoin, Solana, etc)
        address.lastTransactions.forEach(tx => {
          transactions.push({
            tx,
            chain: address.chain,
            walletName: address.name || 'Unnamed Wallet',
            walletAddress: address.address
          });
        });
      }
    });
    
    // Sort by timestamp (newest first)
    transactions.sort((a, b) => {
      const aTime = a.chain === "bitcoin" ? a.tx.timestamp * 1000 : a.tx.timestamp;
      const bTime = b.chain === "bitcoin" ? b.tx.timestamp * 1000 : b.tx.timestamp;
      return bTime - aTime;
    });
    
    return transactions.slice(0, maxTransactions);
  }, [addresses, maxTransactions]);

  if (allTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent transactions found</p>
            <p className="text-sm mt-1">Transactions will appear here after refreshing wallet balances</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Transactions
          <Badge variant="secondary" className="ml-2">
            {allTransactions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded border bg-white dark:bg-card">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Wallet</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Chain</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {allTransactions.map(({ tx, chain, walletName, walletAddress }, index) => {
                const isReceived = tx.type === "received";
                const timestampMs = chain === "bitcoin" ? tx.timestamp * 1000 : tx.timestamp;
                return (
                  <tr key={`${tx.hash}-${index}`} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a
                        href={getExplorerUrl(chain, tx.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer"
                      >
                        {formatDate(new Date(timestampMs))}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-sm">{walletName}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {chain}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        isReceived
                          ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                          : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                      }`}>
                        {isReceived ? "↓ Received" : "↑ Sent"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-right">
                      <span className={isReceived ? "text-green-600" : "text-red-600"}>
                        {isReceived ? "+" : "-"}{tx.value.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 6,
                        })} {tx.asset || CHAIN_SYMBOLS[chain as keyof typeof CHAIN_SYMBOLS]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {allTransactions.length === maxTransactions && (
          <div className="text-center text-muted-foreground text-sm mt-4">
            Showing latest {maxTransactions} transactions
          </div>
        )}
      </CardContent>
    </Card>
  );
}