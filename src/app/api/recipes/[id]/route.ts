import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const uid = Number(session.user.id)
  if (!Number.isFinite(uid)) {
    return NextResponse.json({ error: 'Invalid user' }, { status: 401 })
  }
  const { id } = params

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

  const result = await sql`
    UPDATE recipes SET
      name = ${body.name},
      mode = ${body.mode},
      target_type = ${body.target_type},
      target_gram = ${body.target_gram},
      mold_id = ${body.mold_id},
      mold_params = ${JSON.stringify(body.mold_params ?? {})}::jsonb,
      quantity = ${body.quantity},
      loss_type = ${body.loss_type},
      loss_value = ${body.loss_value},
      ingredients = ${JSON.stringify(body.ingredients)}::jsonb,
      client_updated_at = ${body.client_updated_at}::timestamptz,
      updated_at = now()
    WHERE id = ${id}::uuid AND user_id = ${uid}
    RETURNING id
  `

  if (result.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true, id: result[0].id })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const uid = Number(session.user.id)
  const { id } = params

  const result = await sql`
    DELETE FROM recipes
    WHERE id = ${id}::uuid AND user_id = ${uid}
    RETURNING id
  `

  if (result.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
