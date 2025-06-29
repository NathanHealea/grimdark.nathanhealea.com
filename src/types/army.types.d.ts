

/**
 * Type definition for an Army object.
 */
export type Army = {
  id: number
  name: string
  description: string
  parent_army_id: number | null
  list?: Army[] // Optional property to hold child armies
}