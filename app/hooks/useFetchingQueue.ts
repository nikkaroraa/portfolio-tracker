import { useState, useCallback } from 'react';

export interface FetchingAddress {
  id: string;
  name: string;
  address: string;
  chain: string;
  status: "pending" | "fetching" | "success" | "error" | "rate_limited";
  error?: string;
  retryAt?: Date;
}

export function useFetchingQueue() {
  const [fetchingAddresses, setFetchingAddresses] = useState<FetchingAddress[]>([]);

  const addAddress = useCallback((address: Omit<FetchingAddress, 'status'>) => {
    setFetchingAddresses(prev => [
      ...prev.filter(a => a.id !== address.id),
      { ...address, status: 'pending' as const }
    ]);
  }, []);

  const updateStatus = useCallback((
    id: string, 
    status: FetchingAddress['status'], 
    error?: string,
    retryAt?: Date
  ) => {
    setFetchingAddresses(prev => 
      prev.map(addr => 
        addr.id === id 
          ? { ...addr, status, error, retryAt }
          : addr
      )
    );
  }, []);

  const removeAddress = useCallback((id: string) => {
    setFetchingAddresses(prev => prev.filter(addr => addr.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setFetchingAddresses(prev => 
      prev.filter(addr => 
        addr.status !== 'success' && addr.status !== 'error'
      )
    );
  }, []);

  const startFetching = useCallback((id: string) => {
    updateStatus(id, 'fetching');
  }, [updateStatus]);

  const markSuccess = useCallback((id: string) => {
    updateStatus(id, 'success');
  }, [updateStatus]);

  const markError = useCallback((id: string, error: string) => {
    updateStatus(id, 'error', error);
  }, [updateStatus]);

  const markRateLimited = useCallback((id: string, retryAt: Date) => {
    updateStatus(id, 'rate_limited', undefined, retryAt);
  }, [updateStatus]);

  return {
    fetchingAddresses,
    addAddress,
    updateStatus,
    removeAddress,
    clearCompleted,
    startFetching,
    markSuccess,
    markError,
    markRateLimited
  };
}