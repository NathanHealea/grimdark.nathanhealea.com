'use client'

import Avatar from '@/components/avatar'
import type { RosterEntryWithDetails } from '@/modules/season/queries'
import type { Faction } from '@/types/faction'
import type { Profile } from '@/types/profile'
import { useMemo, useState } from 'react'
import { addParticipant, removeParticipant, updateParticipantFaction } from './roster-actions'
import Link from 'next/link';

type RosterManagerProps = {
  seasonId: number
  roster: RosterEntryWithDetails[]
  profiles: Profile[]
  factions: Faction[]
  profileFactionsMap: Record<string, string[]>
}

export default function RosterManager({
  seasonId,
  roster,
  profiles,
  factions,
  profileFactionsMap,
}: RosterManagerProps) {
  const factionMap = useMemo(() => new Map(factions.map((f) => [f.id, f])), [factions])
  const rosterProfileIds = useMemo(() => new Set(roster.map((r) => r.profile_id)), [roster])
  const availableProfiles = useMemo(
    () => profiles.filter((p) => !rosterProfileIds.has(p.id)),
    [profiles, rosterProfileIds]
  )

  const [selectedProfile, setSelectedProfile] = useState('')
  const [selectedFaction, setSelectedFaction] = useState('')
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [editFaction, setEditFaction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function getFactionLabel(id: string): string {
    const faction = factionMap.get(id)
    if (!faction) return 'Unknown'
    if (faction.parent_id) {
      const parent = factionMap.get(faction.parent_id)
      if (parent) return `${parent.name} > ${faction.name}`
    }
    return faction.name
  }

  function getProfileFactionOptions(profileId: string) {
    const allowedIds = new Set(profileFactionsMap[profileId] ?? [])
    return factions
      .filter((f) => allowedIds.has(f.id))
      .map((f) => ({ id: f.id, label: getFactionLabel(f.id) }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  const factionSelect = (value: string, onChange: (val: string) => void, forProfileId?: string) => {
    const options = forProfileId ? getProfileFactionOptions(forProfileId) : []
    const hasOptions = options.length > 0
    const placeholder = !forProfileId
      ? 'Select a player first...'
      : hasOptions
        ? 'Select faction...'
        : 'No factions on profile'

    return (
      <select
        className="select select-bordered select-sm flex-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || !forProfileId || !hasOptions}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }

  async function handleAdd() {
    if (!selectedProfile || !selectedFaction) return
    setLoading(true)
    setError('')
    const result = await addParticipant(seasonId, selectedProfile, selectedFaction)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSelectedProfile('')
      setSelectedFaction('')
    }
  }

  async function handleRemove(profileId: string, displayName: string) {
    if (!confirm(`Remove ${displayName} from the roster?`)) return
    setLoading(true)
    setError('')
    const result = await removeParticipant(seasonId, profileId)
    setLoading(false)
    if (result.error) setError(result.error)
  }

  async function handleUpdateFaction(profileId: string) {
    if (!editFaction) return
    setLoading(true)
    setError('')
    const result = await updateParticipantFaction(seasonId, profileId, editFaction)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setEditingEntry(null)
      setEditFaction('')
    }
  }

  return (
    <div>
      {error && <p className="form-error mb-4">{error}</p>}

      {/* Add participant form */}
      <div className="mb-6 rounded-lg bg-base-200 p-4">
        <label className="label-text mb-2 block text-sm font-medium">Add participant</label>
        <div className="flex flex-wrap gap-2">
          <select
            className="select select-bordered select-sm flex-1"
            value={selectedProfile}
            onChange={(e) => {
              setSelectedProfile(e.target.value)
              setSelectedFaction('')
            }}
            disabled={loading || availableProfiles.length === 0}
          >
            <option value="" disabled>
              {availableProfiles.length > 0 ? 'Select a player...' : 'All players already on roster'}
            </option>
            {availableProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_name}
              </option>
            ))}
          </select>
          {factionSelect(selectedFaction, setSelectedFaction, selectedProfile || undefined)}
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={handleAdd}
            disabled={loading || !selectedProfile || !selectedFaction}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Roster table */}
      {roster.length === 0 ? (
        <p className="empty-text">No participants yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Faction</th>
                <th className="w-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((entry) => (
                <tr key={entry.profile_id} className="h-16">
                  <td>
                    <Link href={`/profile/${entry.profiles.profile_id}`} className='link link-hover'>
                    <div className="flex gap-4">
                      <div className="">
                        <Avatar src={entry.profiles.avatar_url} displayName={entry.profiles.display_name} size="sm" />
                      </div>
                      <span className="font-semibold">{entry.profiles.display_name}</span>
                    </div>
                    </Link>
                  </td>
                  <td>
                    {editingEntry === entry.profile_id ? (
                      <div className="flex gap-2">
                        {factionSelect(editFaction, setEditFaction, entry.profile_id)}
                        <button
                          type="button"
                          className="btn btn-success btn-xs"
                          onClick={() => handleUpdateFaction(entry.profile_id)}
                          disabled={loading || !editFaction}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => {
                            setEditingEntry(null)
                            setEditFaction('')
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="link link-hover text-left text-sm"
                        onClick={() => {
                          setEditingEntry(entry.profile_id)
                          setEditFaction(entry.faction_id)
                        }}
                      >
                        {getFactionLabel(entry.faction_id)}
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-error btn-outline btn-xs"
                      onClick={() => handleRemove(entry.profile_id, entry.profiles.display_name)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
