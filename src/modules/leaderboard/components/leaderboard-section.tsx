'use client'

import { type ReactNode, useState } from 'react'
import Link from 'next/link'

type LeaderboardSectionProps = {
  overallTable: ReactNode
  seasonTable: ReactNode | null
  seasonName: string | null
  seasonId: number | null
}

export default function LeaderboardSection({ overallTable, seasonTable, seasonName, seasonId }: LeaderboardSectionProps) {
  const [tab, setTab] = useState<'overall' | 'season'>('overall')

  return (
    <div>
      <div className="flex justify-center mb-6" role="tablist" aria-label="Leaderboard views">
        <div className="join">
          <button
            role="tab"
            aria-selected={tab === 'overall'}
            className={`join-item btn btn-sm ${tab === 'overall' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('overall')}
          >
            Overall
          </button>
          <button
            role="tab"
            aria-selected={tab === 'season'}
            disabled={!seasonTable}
            className={`join-item btn btn-sm ${tab === 'season' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('season')}
          >
            {seasonName ?? 'Season'}
          </button>
        </div>
      </div>

      {tab === 'season' && !seasonTable ? (
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body items-center py-12 text-center">
            <p className="text-base-content/50">No active season right now.</p>
          </div>
        </div>
      ) : (
        <div role="tabpanel" key={tab}>
          {tab === 'overall' ? overallTable : seasonTable}
        </div>
      )}

      <div className="mt-4 text-center">
        <Link
          href={tab === 'overall' ? '/leaderboard' : `/seasons/${seasonId}`}
          className="btn btn-ghost btn-sm"
        >
          View full {tab === 'overall' ? 'leaderboard' : 'season'} &rarr;
        </Link>
      </div>
    </div>
  )
}
