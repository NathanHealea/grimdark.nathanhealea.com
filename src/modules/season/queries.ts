import type { Season } from '@/types/season'
import { createClient } from '@/lib/supabase/server'

export async function getSeasons({ includeAll = false } = {}): Promise<Season[]> {
  const supabase = await createClient()

  let query = supabase.from('seasons').select('*')

  if (!includeAll) query = query.eq('status', 'published')

  const { data, error } = await query.order('start_date', { ascending: false })

  if (error) {
    console.error('Failed to fetch seasons:', error)
    return []
  }

  return data as Season[]
}

export async function getCurrentSeason(): Promise<Season | null> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('status', 'published')
    .lte('start_date', today)
    .gte('end_date', today)
    .order('start_date', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // no rows
    console.error('Failed to fetch current season:', error)
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

export async function getNextSeasonNumber(): Promise<number> {
  const supabase = await createClient()

  const { data } = await supabase.from('seasons').select('number').order('number', { ascending: false }).limit(1)

  return (data?.[0]?.number ?? 0) + 1
}
