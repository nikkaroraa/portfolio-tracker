import { useState, useEffect } from 'react'
import { supabase, convertFromDatabase, convertToDatabase, DatabaseAddress } from '../lib/supabase'
import { Address } from '../types'

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      const convertedAddresses = (data as DatabaseAddress[]).map(convertFromDatabase)
      setAddresses(convertedAddresses)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses')
      console.error('Error fetching addresses:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add new address
  const addAddress = async (addressData: Omit<Address, 'id'>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('addresses')
        .insert([convertToDatabase(addressData)])
        .select()
        .single()

      if (error) throw error

      const newAddress = convertFromDatabase(data as DatabaseAddress)
      setAddresses(prev => [...prev, newAddress])
      return newAddress
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add address'
      setError(errorMessage)
      console.error('Error adding address:', err)
      throw new Error(errorMessage)
    }
  }

  // Update address
  const updateAddress = async (id: string, updates: Partial<Omit<Address, 'id'>>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('addresses')
        .update(convertToDatabase(updates as Omit<Address, 'id'>))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updatedAddress = convertFromDatabase(data as DatabaseAddress)
      setAddresses(prev => prev.map(addr => addr.id === id ? updatedAddress : addr))
      return updatedAddress
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update address'
      setError(errorMessage)
      console.error('Error updating address:', err)
      throw new Error(errorMessage)
    }
  }

  // Delete address
  const deleteAddress = async (id: string) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAddresses(prev => prev.filter(addr => addr.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete address'
      setError(errorMessage)
      console.error('Error deleting address:', err)
      throw new Error(errorMessage)
    }
  }

  // Update address balance and related data
  const updateAddressBalance = async (
    id: string, 
    balance: number, 
    tokens?: Address['tokens'], 
    lastTransactions?: Address['lastTransactions'], 
    chainData?: Address['chainData']
  ) => {
    try {
      setError(null)
      
      const updates: Partial<DatabaseAddress> = {
        balance,
        last_updated: new Date().toISOString(),
      }
      
      if (tokens !== undefined) updates.tokens = tokens
      if (lastTransactions !== undefined) updates.last_transactions = lastTransactions
      if (chainData !== undefined) updates.chain_data = chainData

      const { data, error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updatedAddress = convertFromDatabase(data as DatabaseAddress)
      setAddresses(prev => prev.map(addr => addr.id === id ? updatedAddress : addr))
      return updatedAddress
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update address balance'
      setError(errorMessage)
      console.error('Error updating address balance:', err)
      throw new Error(errorMessage)
    }
  }

  // Reorder addresses
  const reorderAddresses = (newOrder: Address[]) => {
    setAddresses(newOrder)
    // Note: If you want to persist the order, you'd need to add an 'order' field to the database
    // and update all addresses with their new order values
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  return {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    updateAddressBalance,
    reorderAddresses,
    refetch: fetchAddresses,
  }
}