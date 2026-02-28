import type { ReactNode } from 'react'

export function OgLayout({ children }: { children: ReactNode }) {
  return (
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
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201, 168, 76, 0.18) 0%, rgba(10, 10, 10, 0) 70%)',
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

      {children}
    </div>
  )
}
