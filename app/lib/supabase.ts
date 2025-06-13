import { createClient } from '@supabase/supabase-js'
import { Address } from '../types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DatabaseAddress {
  id: string
  label: string
  address: string
  chain: string
  network?: string
  balance?: number
  last_updated?: string
  tokens?: any
  last_transactions?: any
  chain_data?: any
  created_at: string
  updated_at: string
}

export function convertFromDatabase(dbAddress: DatabaseAddress): Address {
  return {
    id: dbAddress.id,
    label: dbAddress.label,
    address: dbAddress.address,
    chain: dbAddress.chain,
    network: dbAddress.network,
    balance: dbAddress.balance,
    lastUpdated: dbAddress.last_updated ? new Date(dbAddress.last_updated) : undefined,
    tokens: dbAddress.tokens,
    lastTransactions: dbAddress.last_transactions,
    chainData: dbAddress.chain_data,
  }
}

export function convertToDatabase(address: Omit<Address, 'id'>): Omit<DatabaseAddress, 'id' | 'created_at' | 'updated_at'> {
  return {
    label: address.label,
    address: address.address,
    chain: address.chain,
    network: address.network,
    balance: address.balance,
    last_updated: address.lastUpdated?.toISOString(),
    tokens: address.tokens,
    last_transactions: address.lastTransactions,
    chain_data: address.chainData,
  }
}