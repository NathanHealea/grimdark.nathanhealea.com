'use client'

import { useMemo, useState } from 'react'
import Avatar from '@/components/avatar'
import type { Faction, FactionNode } from '@/types/faction'
import type { Profile } from '@/types/profile'
import type { RosterEntryWithDetails } from '@/modules/season/queries'
import { buildFactionTree } from '@/modules/faction/utils'
import { addParticipant, removeParticipant, updateParticipantFaction } from './roster-actions'

type RosterManagerProps = {
  seasonId: number
  roster: RosterEntryWithDetails[]
  profiles: Profile[]
  factions: Faction[]
}

export default function RosterManager({ seasonId, roster, profiles, factions }: RosterManagerProps) {
  const tree = useMemo(() => buildFactionTree(factions), [factions])
  const factionMap = useMemo(() => new Map(factions.map((f) => [f.id, f])), [factions])
  const rosterProfileIds = useMemo(() => new Set(roster.map((r) => r.profile_id)), [roster])
  const availableProfiles = useMemo(() => profiles.filter((p) => !rosterProfileIds.has(p.id)), [profiles, rosterProfileIds])

  const [selectedProfile, setSelectedProfile] = useState('')
  const [selectedFaction, setSelectedFaction] = useState('')
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [editFaction, setEditFaction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function renderOptions(nodes: FactionNode[], depth: number): React.ReactNode[] {
    const options: React.ReactNode[] = []
    for (const node of nodes) {
      const prefix = depth > 0 ? '\u00A0\u00A0'.repeat(depth) + '└ ' : ''
      options.push(
        <option key={node.id} value={node.id}>
          {prefix}{node.name}
        </option>,
      )
      if (node.children.length > 0) {
        options.push(...renderOptions(node.children, depth + 1))
      }
    }
    return options
  }

  function getFactionLabel(id: string): string {
    const faction = factionMap.get(id)
    if (!faction) return 'Unknown'
    if (faction.parent_id) {
      const parent = factionMap.get(faction.parent_id)
      if (parent) return `${parent.name} > ${faction.name}`
    }
    return faction.name
  }

  const factionSelect = (value: string, onChange: (val: string) => void) => (
    <select
      className="select select-bordered select-sm flex-1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
    >
      <option value="" disabled>
        Select faction...
      </option>
      {tree.map((root) => {
        const children = root.children.length > 0
          ? renderOptions(root.children, 0)
          : [<option key={root.id} value={root.id}>{root.name}</option>]
        return (
          <optgroup key={root.id} label={root.name}>
            {children}
          </optgroup>
        )
      })}
    </select>
  )

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
            onChange={(e) => setSelectedProfile(e.target.value)}
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
          {factionSelect(selectedFaction, setSelectedFaction)}
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
                <tr key={entry.profile_id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={entry.profiles.avatar_url}
                        displayName={entry.profiles.display_name}
                        size="sm"
                      />
                      <span className="font-semibold">{entry.profiles.display_name}</span>
                    </div>
                  </td>
                  <td>
                    {editingEntry === entry.profile_id ? (
                      <div className="flex gap-2">
                        {factionSelect(editFaction, setEditFaction)}
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
