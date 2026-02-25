import Avatar from '@/components/avatar'
import Tooltip from '@/components/tooltip'
import type { LeaderboardEntry } from '@/modules/leaderboard/utils'
import type { Profile } from '@/types/profile'
import { TrophyIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

type LeaderboardTableProps = {
  entries: LeaderboardEntry[]
  profileMap: Map<string, Profile>
}

export default function LeaderboardTable({ entries, profileMap }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body items-center py-12 text-center">
          <TrophyIcon className="size-12 text-base-content/20" />
          <p className="mt-2 text-base-content/50">No battles recorded yet.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="table table-zebra bg-base-200 rounded-box">
          <thead>
            <tr>
              <th className="w-12">
                <Tooltip content="Rank">#</Tooltip>
              </th>
              <th>Player</th>
              <th className="text-center">
                <Tooltip content="Games Played">GP</Tooltip>
              </th>
              <th className="text-center">
                <Tooltip content="Wins">W</Tooltip>
              </th>
              <th className="text-center">
                <Tooltip content="Losses">L</Tooltip>
              </th>
              <th className="text-center">
                <Tooltip content="Draws">D</Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const profile = profileMap.get(entry.profileId)
              return (
                <tr key={entry.profileId}>
                  <td className="font-bold text-base-content/50">{entry.rank}</td>
                  <td>
                    {profile ? (
                      <Link href={`/profile/${profile.profile_id}`} className="flex items-center gap-3 hover:underline">
                        <Avatar src={profile.avatar_url} displayName={profile.display_name} size="sm" />
                        <span className="font-medium">{profile.display_name}</span>
                      </Link>
                    ) : (
                      <span className="text-base-content/50">Unknown</span>
                    )}
                  </td>
                  <td className="text-center">{entry.gamesPlayed}</td>
                  <td className="text-center text-success">{entry.wins}</td>
                  <td className="text-center text-error">{entry.losses}</td>
                  <td className="text-center text-warning">{entry.draws}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 sm:hidden">
        {entries.map((entry) => {
          const profile = profileMap.get(entry.profileId)
          return (
            <div key={entry.profileId} className="card bg-base-200 shadow-sm">
              <div className="card-body flex-row items-center gap-4 p-4">
                <span className="text-2xl font-bold text-base-content/30 w-8 text-center shrink-0">{entry.rank}</span>
                {profile ? (
                  <Link href={`/profile/${profile.profile_id}`} className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar src={profile.avatar_url} displayName={profile.display_name} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{profile.display_name}</p>
                      <div className="flex gap-3 text-xs mt-1">
                        <span>{entry.gamesPlayed} GP</span>
                        <span className="text-success">{entry.wins}W</span>
                        <span className="text-error">{entry.losses}L</span>
                        <span className="text-warning">{entry.draws}D</span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <span className="text-base-content/50">Unknown</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
