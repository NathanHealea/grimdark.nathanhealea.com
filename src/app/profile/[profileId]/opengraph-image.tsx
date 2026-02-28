import { ImageResponse } from 'next/og'
import { OgLayout } from '@/lib/og/og-layout'
import { createClient } from '@/lib/supabase/server'
import { getFactions, getProfileFactionIds } from '@/modules/faction/queries'

export const runtime = 'edge'

export const alt = 'Player Profile - Grimdark League'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params
  const id = Number(profileId)

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('profile_id', id)
    .single()

  const displayName = profile?.display_name ?? 'Unknown Player'

  let factionLabels: string[] = []
  if (profile) {
    const [factions, factionIds] = await Promise.all([getFactions(), getProfileFactionIds(profile.id)])
    const factionMap = new Map(factions.map((f) => [f.id, f]))
    factionLabels = factionIds.map((fid) => factionMap.get(fid)?.name).filter((n): n is string => !!n)
  }

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
          {/* Subtitle */}
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
              Player Profile
            </span>
            <div
              style={{
                width: 60,
                height: 1,
                background: 'linear-gradient(to left, rgba(10, 10, 10, 0), #c9a84c)',
              }}
            />
          </div>

          {/* Player name */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#c9a84c',
              textAlign: 'center',
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            {displayName}
          </div>

          {/* Factions */}
          {factionLabels.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 12,
                maxWidth: 900,
              }}
            >
              {factionLabels.slice(0, 5).map((name) => (
                <div
                  key={name}
                  style={{
                    fontSize: 20,
                    color: '#e5e5e5',
                    padding: '8px 20px',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                    borderRadius: 6,
                    background: 'rgba(201, 168, 76, 0.08)',
                  }}
                >
                  {name}
                </div>
              ))}
            </div>
          )}

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
