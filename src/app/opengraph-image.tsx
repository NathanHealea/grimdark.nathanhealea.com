import { ImageResponse } from 'next/og'
import { OgLayout } from '@/lib/og/og-layout'

export const runtime = 'edge'

export const alt = 'Grimdark League - A Warhammer 40k League'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <OgLayout>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#c9a84c' }}>Grimdark</span>
            <span style={{ color: '#e5e5e5', fontWeight: 300, marginTop: 4 }}>League</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 8,
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
              Warhammer 40k League
            </span>
            <div
              style={{
                width: 60,
                height: 1,
                background: 'linear-gradient(to left, rgba(10, 10, 10, 0), #c9a84c)',
              }}
            />
          </div>
          <p
            style={{
              fontSize: 20,
              color: '#a3a3a3',
              maxWidth: 600,
              textAlign: 'center',
              lineHeight: 1.6,
              marginTop: 16,
            }}
          >
            Track battles. Climb the leaderboard. Conquer the grimdark.
          </p>
        </div>
      </OgLayout>
    ),
    { ...size },
  )
}
