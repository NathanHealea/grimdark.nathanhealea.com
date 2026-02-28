import Avatar from '@/components/avatar'
import type { RosterEntryWithDetails } from '@/modules/season/queries'
import Link from 'next/link'

type SeasonRosterProps = {
  roster: RosterEntryWithDetails[]
}

export default function SeasonRoster({ roster }: SeasonRosterProps) {
  if (roster.length === 0) {
    return <p className="empty-text">No players have joined this season yet.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {roster.map((entry) => (
        <Link
          key={entry.profile_id}
          href={`/members/${entry.profiles.profile_id}`}
          className="card-interactive"
        >
          <div className="card-body flex-row items-center gap-3 p-3">
            <Avatar src={entry.profiles.avatar_url} displayName={entry.profiles.display_name} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{entry.profiles.display_name}</p>
              <p className="truncate text-sm text-base-content/60">{entry.factions.name}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
