import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const uid = Number(session.user.id)
  if (!Number.isFinite(uid)) {
    return NextResponse.json({ error: 'Invalid user' }, { status: 401 })
  }

  const rows = await sql`
    SELECT id, name, ingredients, updated_at
    FROM recipes
    WHERE user_id = ${uid}
    ORDER BY updated_at DESC
  `
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const uid = Number(session.user.id)
  if (!Number.isFinite(uid)) {
    return NextResponse.json({ error: 'Invalid user' }, { status: 401 })
  }

  const body = (await req.json()) as {
    name: string
    mode: string
    target_type: string
    target_gram: number | null
    mold_id: string | null
    mold_params: Record<string, unknown>
    quantity: number
    loss_type: string
    loss_value: number | null
    ingredients: unknown
    client_updated_at: string
  }

  await sql`
    INSERT INTO recipes (
      user_id,
      name,
      mode,
      target_type,
      target_gram,
      mold_id,
      mold_params,
      quantity,
      loss_type,
      loss_value,
      ingredients,
      client_updated_at
    ) VALUES (
      ${uid},
      ${body.name},
      ${body.mode},
      ${body.target_type},
      ${body.target_gram},
      ${body.mold_id},
      ${JSON.stringify(body.mold_params ?? {})}::jsonb,
      ${body.quantity},
      ${body.loss_type},
      ${body.loss_value},
      ${JSON.stringify(body.ingredients)}::jsonb,
      ${body.client_updated_at}::timestamptz
    )
  `

  return NextResponse.json({ ok: true })
}
