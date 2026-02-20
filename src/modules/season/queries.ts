import type { Season } from '@/types/season'
import { createClient } from '@/lib/supabase/server'

export async function getSeasons(): Promise<Season[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('seasons').select('*').order('start_date', { ascending: false })

  if (error) {
    console.error('Failed to fetch seasons:', error)
    return []
  }

  return data as Season[]
}

export async function getActiveSeason(): Promise<Season | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('seasons').select('*').eq('is_active', true).single()

  if (error) {
    if (error.code === 'PGRST116') return null // no rows
    console.error('Failed to fetch active season:', error)
    return null
  }

  return data as Season
}

export async function getSeasonById(id: number): Promise<Season | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('seasons').select('*').eq('id', id).single()

  if (error) {
    console.error('Failed to fetch season:', error)
    return null
  }

  return data as Season
}
