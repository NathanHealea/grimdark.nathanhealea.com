export type Faction = {
  id: string
  parent_id: string | null
  name: string
  created_at: string
}

export type ProfileFaction = {
  profile_id: string
  faction_id: string
}
