import { ImageResponse } from 'next/og'
import { OgLayout } from '@/lib/og/og-layout'
import { createClient } from '@/lib/supabase/server'
import { getBattleReportById } from '@/modules/battle-report/queries'
import { getFactions } from '@/modules/faction/queries'

export const runtime = 'edge'

export const alt = 'Battle Report - Grimdark League'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const [report, { data: profiles }, factions] = await Promise.all([
    getBattleReportById(id),
    supabase.from('profiles').select('id, display_name'),
    getFactions(),
  ])

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name ?? 'Unknown']))
  const factionMap = new Map(factions.map((f) => [f.id, f]))

  const attackerName = report?.attacker_id ? profileMap.get(report.attacker_id) ?? 'Unknown' : 'TBD'
  const defenderName = report?.defender_id ? profileMap.get(report.defender_id) ?? 'Unknown' : 'TBD'
  const attackerFaction = report?.attacker_faction_id ? factionMap.get(report.attacker_faction_id)?.name ?? '' : ''
  const defenderFaction = report?.defender_faction_id ? factionMap.get(report.defender_faction_id)?.name ?? '' : ''
  const attackerScore = report?.attacker_score ?? 0
  const defenderScore = report?.defender_score ?? 0
  const outcome = report?.attacker_outcome

  const outcomeLabel = outcome === 'win' ? `${attackerName} Wins` : outcome === 'loss' ? `${defenderName} Wins` : outcome === 'draw' ? 'Draw' : ''
  const outcomeColor = outcome === 'win' ? '#22c55e' : outcome === 'loss' ? '#ef4444' : outcome === 'draw' ? '#eab308' : '#a3a3a3'

  return new ImageResponse(
    (
      <OgLayout>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            width: '100%',
            padding: '0 80px',
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
              Battle Report
            </span>
            <div
              style={{
                width: 60,
                height: 1,
                background: 'linear-gradient(to left, rgba(10, 10, 10, 0), #c9a84c)',
              }}
            />
          </div>

          {/* Versus layout */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 40,
              width: '100%',
            }}
          >
            {/* Attacker side */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                flex: 1,
              }}
            >
              <div style={{ fontSize: 16, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Attacker
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#c9a84c', textAlign: 'center' }}>
                {attackerName}
              </div>
              {attackerFaction && (
                <div style={{ fontSize: 18, color: '#a3a3a3' }}>{attackerFaction}</div>
              )}
              <div style={{ fontSize: 56, fontWeight: 700, color: '#e5e5e5', marginTop: 8 }}>
                {attackerScore}
              </div>
            </div>

            {/* VS divider */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: '#a3a3a3' }}>VS</div>
            </div>

            {/* Defender side */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                flex: 1,
              }}
            >
              <div style={{ fontSize: 16, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Defender
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#c9a84c', textAlign: 'center' }}>
                {defenderName}
              </div>
              {defenderFaction && (
                <div style={{ fontSize: 18, color: '#a3a3a3' }}>{defenderFaction}</div>
              )}
              <div style={{ fontSize: 56, fontWeight: 700, color: '#e5e5e5', marginTop: 8 }}>
                {defenderScore}
              </div>
            </div>
          </div>

          {/* Outcome */}
          {outcomeLabel && (
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: outcomeColor,
                padding: '8px 24px',
                border: `2px solid ${outcomeColor}`,
                borderRadius: 8,
              }}
            >
              {outcomeLabel}
            </div>
          )}
        </div>
      </OgLayout>
    ),
    { ...size },
  )
}
