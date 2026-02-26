'use client'

import { useMemo, useState } from 'react'
import type { Faction, FactionNode } from '@/types/faction'
import { buildFactionTree } from '../utils'

type FactionSelectorProps = {
  factions: Faction[]
  selectedIds?: string[]
  name?: string
  error?: string
}

export default function FactionSelector({
  factions,
  selectedIds = [],
  name = 'faction_ids',
  error,
}: FactionSelectorProps) {
  const tree = useMemo(() => buildFactionTree(factions), [factions])
  const factionMap = useMemo(() => new Map(factions.map((f) => [f.id, f])), [factions])
  const [selected, setSelected] = useState<string[]>(selectedIds)
  const [selectValue, setSelectValue] = useState('')

  const selectedSet = useMemo(() => new Set(selected), [selected])

  function handleAdd() {
    if (selectValue && !selectedSet.has(selectValue)) {
      setSelected((prev) => [...prev, selectValue])
      setSelectValue('')
    }
  }

  function handleRemove(id: string) {
    setSelected((prev) => prev.filter((v) => v !== id))
  }

  function renderOptions(nodes: FactionNode[], depth: number): React.ReactNode[] {
    const options: React.ReactNode[] = []
    for (const node of nodes) {
      if (!selectedSet.has(node.id)) {
        const prefix = depth > 0 ? '\u00A0\u00A0'.repeat(depth) + '└ ' : ''
        options.push(
          <option key={node.id} value={node.id}>
            {prefix}{node.name}
          </option>
        )
      }
      if (node.children.length > 0) {
        options.push(...renderOptions(node.children, depth + 1))
      }
    }
    return options
  }

  function getFactionLabel(id: string): string {
    const faction = factionMap.get(id)
    if (!faction) return id
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

  // Check if dropdown has any available options
  const hasAvailable = factions.some((f) => !selectedSet.has(f.id))

  return (
    <div>
      <div className="flex gap-2">
        <select
          className="select select-bordered flex-1"
          value={selectValue}
          onChange={(e) => setSelectValue(e.target.value)}
          disabled={!hasAvailable}
        >
          <option value="" disabled>
            {hasAvailable ? 'Select a faction...' : 'All factions selected'}
          </option>
          {tree.map((root) => {
            const children = root.children.length > 0
              ? renderOptions(root.children, 0)
              : !selectedSet.has(root.id)
                ? [<option key={root.id} value={root.id}>{root.name}</option>]
                : []
            if (children.length === 0) return null
            return (
              <optgroup key={root.id} label={root.name}>
                {children}
              </optgroup>
            )
          })}
        </select>
        <button
          type="button"
          className="btn btn-success"
          onClick={handleAdd}
          disabled={!selectValue}
        >
          Add
        </button>
      </div>

      {selected.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {selected.map((id) => (
            <li key={id} className="flex items-center justify-between rounded-lg bg-base-300 pl-2 py-2">
              <span className="text-sm">{getFactionLabel(id)}</span>
              <button
                type="button"
                className="btn btn-error btn-xs "
                onClick={() => handleRemove(id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
