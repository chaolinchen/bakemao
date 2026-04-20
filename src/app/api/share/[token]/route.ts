import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params

  // Basic UUID validation
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRe.test(token)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  const rows = await sql`
    SELECT name, ingredients
    FROM recipes
    WHERE share_token = ${token}::uuid
  `

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    name: rows[0].name as string,
    ingredients: rows[0].ingredients,
  })
}
