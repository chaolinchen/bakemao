import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

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
