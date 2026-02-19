import type { Faction, FactionNode } from '@/types/faction'

export function buildFactionTree(factions: Faction[]): FactionNode[] {
  const nodeMap = new Map<string, FactionNode>()

  for (const faction of factions) {
    nodeMap.set(faction.id, { ...faction, children: [] })
  }

  const roots: FactionNode[] = []

  for (const node of nodeMap.values()) {
    if (node.parent_id) {
      const parent = nodeMap.get(node.parent_id)
      if (parent) {
        parent.children.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  roots.sort((a, b) => a.name.localeCompare(b.name))
  for (const node of nodeMap.values()) {
    node.children.sort((a, b) => a.name.localeCompare(b.name))
  }

  return roots
}
