import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Tag } from '../types'

interface DatabaseTag {
  id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

function convertFromDatabase(dbTag: DatabaseTag): Tag {
  return {
    id: dbTag.id,
    name: dbTag.name,
    color: dbTag.color,
    createdAt: new Date(dbTag.created_at),
  }
}

function convertToDatabase(tag: Omit<Tag, 'id' | 'createdAt'>): Omit<DatabaseTag, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: tag.name,
    color: tag.color,
  }
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all tags
  const fetchTags = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      const convertedTags = (data as DatabaseTag[]).map(convertFromDatabase)
      setTags(convertedTags)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags')
      console.error('Error fetching tags:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add new tag
  const addTag = async (tagData: Omit<Tag, 'id' | 'createdAt'>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('tags')
        .insert([convertToDatabase(tagData)])
        .select()
        .single()

      if (error) throw error

      const newTag = convertFromDatabase(data as DatabaseTag)
      setTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)))
      return newTag
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add tag'
      setError(errorMessage)
      console.error('Error adding tag:', err)
      throw new Error(errorMessage)
    }
  }

  // Update tag
  const updateTag = async (id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('tags')
        .update(convertToDatabase(updates as Omit<Tag, 'id' | 'createdAt'>))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updatedTag = convertFromDatabase(data as DatabaseTag)
      setTags(prev => prev.map(tag => tag.id === id ? updatedTag : tag).sort((a, b) => a.name.localeCompare(b.name)))
      return updatedTag
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update tag'
      setError(errorMessage)
      console.error('Error updating tag:', err)
      throw new Error(errorMessage)
    }
  }

  // Delete tag
  const deleteTag = async (id: string) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTags(prev => prev.filter(tag => tag.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete tag'
      setError(errorMessage)
      console.error('Error deleting tag:', err)
      throw new Error(errorMessage)
    }
  }

  // Get tag by ID
  const getTagById = (id: string): Tag | undefined => {
    return tags.find(tag => tag.id === id)
  }

  // Get tags by IDs
  const getTagsByIds = (ids: string[]): Tag[] => {
    return tags.filter(tag => ids.includes(tag.id))
  }

  useEffect(() => {
    fetchTags()
  }, [])

  return {
    tags,
    loading,
    error,
    addTag,
    updateTag,
    deleteTag,
    getTagById,
    getTagsByIds,
    refetch: fetchTags,
  }
}