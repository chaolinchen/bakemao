import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BakeMao 烘焙貓'
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
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: '#E6EEF5',
          padding: '80px 96px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            backgroundColor: '#FFFBF2',
            border: '2.5px solid #6B4A2F',
            borderRadius: 40,
            padding: '12px 28px',
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: '#C8602A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            B
          </div>
          <span style={{ fontSize: 24, color: '#6B4A2F', fontWeight: 700 }}>
            BakeMao 烘焙貓
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#3D2918',
            lineHeight: 1.15,
            marginBottom: 28,
          }}
        >
          烘焙配方換算
        </div>

        {/* Sub */}
        <div style={{ fontSize: 34, color: '#6B4A2F', marginBottom: 60 }}>
          換模具・算克數・多組配方，全自動
        </div>

        {/* Tag pills */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['圓模 / 塔圈 / 杯型', '烘焙百分比', '備料彙總'].map((t) => (
            <div
              key={t}
              style={{
                backgroundColor: '#FFFBF2',
                border: '2px solid #C8602A',
                borderRadius: 24,
                padding: '8px 20px',
                fontSize: 22,
                color: '#C8602A',
                fontWeight: 600,
              }}
            >
              {t}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            right: 96,
            fontSize: 22,
            color: '#8A7968',
          }}
        >
          bakemao.smallfatmao.com
        </div>
      </div>
    ),
    { ...size }
  )
}
