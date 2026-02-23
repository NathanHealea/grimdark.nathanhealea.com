export type Profile = {
  id: string
  user_id: string | null
  link_id: string | null
  role: 'member' | 'organizer'
  profile_id: number
  display_name: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}
