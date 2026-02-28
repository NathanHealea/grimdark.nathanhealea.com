'use client'

import { useMemo, useState } from 'react'
import type { Faction, FactionNode } from '@/types/faction'
import { buildFactionTree } from '@/modules/faction/utils'
import { joinSeason, leaveSeason, updateRosterFaction } from './roster-actions'

type JoinSeasonFormProps = {
  seasonId: number
  factions: Faction[]
  currentFactionId?: string
  isOnRoster: boolean
}

export default function JoinSeasonForm({ seasonId, factions, currentFactionId, isOnRoster }: JoinSeasonFormProps) {
  const tree = useMemo(() => buildFactionTree(factions), [factions])
  const factionMap = useMemo(() => new Map(factions.map((f) => [f.id, f])), [factions])
  const [selectedFaction, setSelectedFaction] = useState(currentFactionId ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)

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
    if (!faction) return 'Unknown Faction'
    if (faction.parent_id) {
      const parent = factionMap.get(faction.parent_id)
      if (parent) {
        if (parent.parent_id) {
          const grandparent = factionMap.get(parent.parent_id)
          if (grandparent) return `${grandparent.name} > ${parent.name} > ${faction.name}`
        }
        return `${parent.name} > ${faction.name}`
      }
    }
    return faction.name
  }

  async function handleJoin() {
    if (!selectedFaction) return
    setLoading(true)
    setError('')
    const result = await joinSeason(seasonId, selectedFaction)
    setLoading(false)
    if (result.error) setError(result.error)
  }

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this season?')) return
    setLoading(true)
    setError('')
    const result = await leaveSeason(seasonId)
    setLoading(false)
    if (result.error) setError(result.error)
  }

  async function handleUpdateFaction() {
    if (!selectedFaction || selectedFaction === currentFactionId) return
    setLoading(true)
    setError('')
    const result = await updateRosterFaction(seasonId, selectedFaction)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setEditing(false)
    }
  }

  const factionSelect = (
    <select
      className="select select-bordered flex-1"
      value={selectedFaction}
      onChange={(e) => setSelectedFaction(e.target.value)}
      disabled={loading}
    >
      <option value="" disabled>
        Select your army...
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

  if (isOnRoster && !editing) {
    return (
      <div className="rounded-lg bg-base-200 p-4">
        <p className="text-sm text-base-content/70">
          You&apos;re playing <strong>{getFactionLabel(currentFactionId!)}</strong> this season.
        </p>
        <div className="mt-3 flex gap-2">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(true)} disabled={loading}>
            Change Army
          </button>
          <button type="button" className="btn btn-error btn-outline btn-sm" onClick={handleLeave} disabled={loading}>
            {loading ? 'Leaving...' : 'Leave Season'}
          </button>
        </div>
        {error && <p className="form-error mt-2">{error}</p>}
      </div>
    )
  }

  if (isOnRoster && editing) {
    return (
      <div className="rounded-lg bg-base-200 p-4">
        <label className="label-text mb-1 block text-sm font-medium">Change your army</label>
        <div className="flex gap-2">
          {factionSelect}
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={handleUpdateFaction}
            disabled={loading || !selectedFaction || selectedFaction === currentFactionId}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setEditing(false)
              setSelectedFaction(currentFactionId ?? '')
            }}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
        {error && <p className="form-error mt-2">{error}</p>}
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-base-200 p-4">
      <label className="label-text mb-1 block text-sm font-medium">Join this season</label>
      <div className="flex gap-2">
        {factionSelect}
        <button
          type="button"
          className="btn btn-success btn-sm"
          onClick={handleJoin}
          disabled={loading || !selectedFaction}
        >
          {loading ? 'Joining...' : 'Join Season'}
        </button>
      </div>
      {error && <p className="form-error mt-2">{error}</p>}
    </div>
  )
}
