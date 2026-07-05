import type { ForceDisposition } from '@/types/force-disposition'
import { createClient } from '@/lib/supabase/server'

export async function getForceDispositionsByEditionId(editionId: number): Promise<ForceDisposition[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('force_dispositions')
    .select('*')
    .eq('edition_id', editionId)
    .order('name')

  if (error) {
    console.error('Failed to fetch force dispositions:', error)
    return []
  }

  return data as ForceDisposition[]
}

export async function getForceDispositionById(id: number): Promise<ForceDisposition | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('force_dispositions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch force disposition:', error)
    return null
  }

  return data as ForceDisposition | null
}
