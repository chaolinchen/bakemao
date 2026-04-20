import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const uid = Number(session.user.id)
  const { id } = params

  // Return existing token if already generated
  const existing = await sql`
    SELECT share_token FROM recipes
    WHERE id = ${id}::uuid AND user_id = ${uid}
  `
  if (existing.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (existing[0].share_token) {
    return NextResponse.json({ token: existing[0].share_token as string })
  }

  // Generate new token
  const token = crypto.randomUUID()
  await sql`
    UPDATE recipes SET share_token = ${token}::uuid
    WHERE id = ${id}::uuid AND user_id = ${uid}
  `

  return NextResponse.json({ token })
}
