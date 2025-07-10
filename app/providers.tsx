"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { ToastProvider, useToast } from "./hooks/useToast";

function QueryProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry on rate limit errors
          if (error instanceof Error && 
              (error.message.includes('Rate limit') || 
               error.message.includes('429'))) {
            return false;
          }
          // Don't retry on invalid address errors
          if (error instanceof Error && 
              (error.message.includes('Invalid') || 
               error.message.includes('address'))) {
            return false;
          }
          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        onError: (error) => {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          showToast({
            type: 'error',
            title: 'Error',
            message: errorMessage,
          });
        },
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <QueryProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryProvider>
    </ToastProvider>
  );
}
