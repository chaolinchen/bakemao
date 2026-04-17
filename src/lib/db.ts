import { neon, Pool } from '@neondatabase/serverless'

/** Tagged template SQL（Route Handlers / Server Actions） */
export const sql = neon(process.env.DATABASE_URL!)

/**
 * Pool 僅供 NextAuth NeonAdapter 使用。
 * Neon 建議在 request 週期內建立 Pool（見 auth.ts 工廠函式）。
 */
export function createPool() {
  return new Pool({ connectionString: process.env.DATABASE_URL! })
}
