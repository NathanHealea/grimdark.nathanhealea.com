import { ImageResponse } from 'next/og'
import { OgLayout } from '@/lib/og/og-layout'
import { getBattlePoints } from '@/modules/battle-report/queries'
import { getSeasonById } from '@/modules/season/queries'
import { formatSeasonName, isCurrentSeason } from '@/types/season'

export const runtime = 'edge'

export const alt = 'Season - Grimdark League'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function formatDate(dateString: string): string {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const seasonId = Number(id)

  const [season, battlePoints] = await Promise.all([getSeasonById(seasonId), getBattlePoints()])

  const seasonName = season ? formatSeasonName(season) : 'Unknown Season'
  const dateRange = season ? `${formatDate(season.start_date)} – ${formatDate(season.end_date)}` : ''
  const bp = season ? battlePoints.find((b) => b.id === season.battle_points_id) : null
  const isCurrent = season ? isCurrentSeason(season) : false

  return new ImageResponse(
    (
      <OgLayout>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 60,
                height: 1,
                background: 'linear-gradient(to right, rgba(10, 10, 10, 0), #c9a84c)',
              }}
            />
            <span
              style={{
                fontSize: 18,
                color: '#a3a3a3',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              League Season
            </span>
            <div
              style={{
                width: 60,
                height: 1,
                background: 'linear-gradient(to left, rgba(10, 10, 10, 0), #c9a84c)',
              }}
            />
          </div>

          {/* Season name */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#c9a84c',
              textAlign: 'center',
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            {seasonName}
          </div>

          {/* Date range */}
          {dateRange && (
            <div style={{ fontSize: 24, color: '#e5e5e5' }}>{dateRange}</div>
          )}

          {/* Details row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
            }}
          >
            {bp && (
              <div
                style={{
                  fontSize: 20,
                  color: '#a3a3a3',
                  padding: '8px 20px',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  borderRadius: 6,
                  background: 'rgba(201, 168, 76, 0.08)',
                }}
              >
                {bp.name} ({bp.size} pts)
              </div>
            )}
            {isCurrent && (
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#22c55e',
                  padding: '8px 20px',
                  border: '2px solid #22c55e',
                  borderRadius: 6,
                }}
              >
                Current Season
              </div>
            )}
          </div>

          {/* Site branding */}
          <div
            style={{
              fontSize: 16,
              color: '#a3a3a3',
              marginTop: 8,
              letterSpacing: '0.1em',
            }}
          >
            GRIMDARK LEAGUE
          </div>
        </div>
      </OgLayout>
    ),
    { ...size },
  )
}
