import { createClient } from '@supabase/supabase-js'
import { Address, Tag, TokenBalance, ChainData } from '../types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DatabaseAddress {
  id: string
  label: string
  address: string
  chain: string
  network?: string
  description?: string
  tags?: Tag[]
  balance?: number
  last_updated?: string
  tokens?: TokenBalance[]
  last_transactions?: Address['lastTransactions']
  chain_data?: ChainData[]
  created_at: string
  updated_at: string
}

export function convertFromDatabase(dbAddress: DatabaseAddress): Address {
  return {
    id: dbAddress.id,
    name: dbAddress.label, // Map label column to name property
    address: dbAddress.address,
    chain: dbAddress.chain,
    network: dbAddress.network,
    description: dbAddress.description,
    tags: dbAddress.tags || [],
    balance: dbAddress.balance,
    lastUpdated: dbAddress.last_updated ? new Date(dbAddress.last_updated) : undefined,
    tokens: dbAddress.tokens,
    lastTransactions: dbAddress.last_transactions,
    chainData: dbAddress.chain_data,
  }
}

export function convertToDatabase(address: Omit<Address, 'id'>): Omit<DatabaseAddress, 'id' | 'created_at' | 'updated_at'> {
  return {
    label: address.name, // Map name property to label column
    address: address.address,
    chain: address.chain,
    network: address.network,
    description: address.description,
    tags: address.tags || [],
    balance: address.balance,
    last_updated: address.lastUpdated?.toISOString(),
    tokens: address.tokens,
    last_transactions: address.lastTransactions,
    chain_data: address.chainData,
  }
}