import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Grimdark League - A Warhammer 40k League'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold glow overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201, 168, 76, 0.18) 0%, rgba(10, 10, 10, 0) 70%)',
          }}
        />

        {/* Border accent top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, rgba(10, 10, 10, 0), #c9a84c, rgba(10, 10, 10, 0))',
          }}
        />
        {/* Border accent bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, rgba(10, 10, 10, 0), #c9a84c, rgba(10, 10, 10, 0))',
          }}
        />

        {/* Corner crosshairs */}
        {/* Top-left */}
        <div style={{ position: 'absolute', top: 24, left: 24, width: 40, height: 40, display: 'flex' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 1, background: '#c9a84c', opacity: 0.4 }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 40, background: '#c9a84c', opacity: 0.4 }} />
        </div>
        {/* Top-right */}
        <div style={{ position: 'absolute', top: 24, right: 24, width: 40, height: 40, display: 'flex' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 1, background: '#c9a84c', opacity: 0.4 }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: 1, height: 40, background: '#c9a84c', opacity: 0.4 }} />
        </div>
        {/* Bottom-left */}
        <div style={{ position: 'absolute', bottom: 24, left: 24, width: 40, height: 40, display: 'flex' }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 1, background: '#c9a84c', opacity: 0.4 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 1, height: 40, background: '#c9a84c', opacity: 0.4 }} />
        </div>
        {/* Bottom-right */}
        <div style={{ position: 'absolute', bottom: 24, right: 24, width: 40, height: 40, display: 'flex' }}>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 1, background: '#c9a84c', opacity: 0.4 }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 1, height: 40, background: '#c9a84c', opacity: 0.4 }} />
        </div>

        {/* Title */}
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
      </div>
    ),
    { ...size },
  )
}
