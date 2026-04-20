import { ImageResponse } from 'next/og'
import { sql } from '@/lib/db'

export const runtime = 'edge'
export const alt = 'BakeMao 烘焙貓 配方分享'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Ingredient = { name: string; value: string | number }
type Component = { name?: string; ingredients?: Ingredient[] }
type Stored = {
  lines?: Ingredient[]
  components?: Component[]
  compQuantity?: number
}

export default async function Image({
  params,
}: {
  params: { token: string }
}) {
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  let recipeName = 'BakeMao 配方'
  let subtitle = ''
  let ingredientLines: string[] = []

  if (uuidRe.test(params.token)) {
    try {
      const rows = await sql`
        SELECT name, ingredients FROM recipes
        WHERE share_token = ${params.token}::uuid
      `
      if (rows.length > 0) {
        recipeName = rows[0].name as string
        const ing = rows[0].ingredients as Stored

        if (Array.isArray(ing.components) && ing.components.length > 0) {
          subtitle = `${ing.components.length} 個組合・${ing.compQuantity ?? 6} 份`
          for (const c of ing.components.slice(0, 2)) {
            if (c.name) ingredientLines.push(`【${c.name}】`)
            for (const item of (c.ingredients ?? []).slice(0, 3)) {
              ingredientLines.push(`${item.name}  ${item.value}%`)
            }
          }
          if (ing.components.length > 2) {
            ingredientLines.push(`…還有 ${ing.components.length - 2} 個組合`)
          }
        } else if (Array.isArray(ing.lines)) {
          subtitle = `${ing.lines.length} 項材料`
          ingredientLines = ing.lines
            .slice(0, 5)
            .map((l) => `${l.name}  ${l.value}%`)
          if (ing.lines.length > 5) {
            ingredientLines.push(`…共 ${ing.lines.length} 項`)
          }
        }
      }
    } catch {
      // fallback to default
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F7F0E6',
          padding: '60px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: '#C8602A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            B
          </div>
          <span style={{ fontSize: 22, color: '#8A7968', fontWeight: 500 }}>
            BakeMao 烘焙貓
          </span>
        </div>

        {/* Recipe name */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#3D2918',
            lineHeight: 1.2,
            marginBottom: 12,
            maxWidth: 900,
          }}
        >
          {recipeName}
        </div>

        {subtitle ? (
          <div style={{ fontSize: 26, color: '#8A7968', marginBottom: 40 }}>
            {subtitle}
          </div>
        ) : null}

        {/* Ingredient preview */}
        {ingredientLines.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              backgroundColor: 'white',
              borderRadius: 20,
              padding: '28px 36px',
              border: '1.5px solid #E5D8C8',
              flex: 1,
              maxHeight: 280,
              overflow: 'hidden',
            }}
          >
            {ingredientLines.map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: line.startsWith('【') ? 20 : 22,
                  color: line.startsWith('【') ? '#8A7968' : '#3D2918',
                  fontWeight: line.startsWith('【') ? 500 : 400,
                  display: 'flex',
                }}
              >
                {line}
              </div>
            ))}
          </div>
        ) : null}

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 24,
            fontSize: 20,
            color: '#C8602A',
          }}
        >
          bakemao.smallfatmao.com
        </div>
      </div>
    ),
    { ...size }
  )
}
