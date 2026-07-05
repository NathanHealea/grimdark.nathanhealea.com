import type { Edition } from '@/types/edition'
import { createClient } from '@/lib/supabase/server'

export async function getEditions({ includeAll = false } = {}): Promise<Edition[]> {
  const supabase = await createClient()

  let query = supabase.from('editions').select('*')

  if (!includeAll) query = query.eq('status', 'published')

  const { data, error } = await query.order('id', { ascending: true })

  if (error) {
    console.error('Failed to fetch editions:', error)
    return []
  }

  return data as Edition[]
}

export async function getPublishedEditions(): Promise<Edition[]> {
  return getEditions({ includeAll: false })
}

export async function getDefaultEdition(): Promise<Edition | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('editions')
    .select('*')
    .eq('is_default', true)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch default edition:', error)
    return null
  }

  return data as Edition | null
}

export async function getEditionById(id: number): Promise<Edition | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('editions').select('*').eq('id', id).single()

  if (error) {
    console.error('Failed to fetch edition:', error)
    return null
  }

  return data as Edition
}
