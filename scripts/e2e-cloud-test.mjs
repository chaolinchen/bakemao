// 雲端配方 E2E：用偽造的 Auth.js JWT session 直接打 dev API，驗證
// 「新增不重複、更新就地覆蓋」。讀 .env.local 的 DATABASE_URL + AUTH_SECRET。
// 用法：node scripts/e2e-cloud-test.mjs   （dev server 須在 :3070）
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'
import { encode } from '@auth/core/jwt'

const BASE = process.env.E2E_BASE || 'http://localhost:3070'

// --- 讀 .env.local ---
const env = {}
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const DATABASE_URL = env.DATABASE_URL
const AUTH_SECRET = env.AUTH_SECRET
if (!DATABASE_URL || !AUTH_SECRET) throw new Error('缺 DATABASE_URL / AUTH_SECRET')

const sql = neon(DATABASE_URL)
const SALT = 'authjs.session-token' // dev(http) 的 cookie 名

const ok = (b, msg) => console.log(`${b ? '✅' : '❌'} ${msg}`)
let allPass = true
const check = (b, msg) => { if (!b) allPass = false; ok(b, msg) }

function payload(name) {
  return {
    name,
    mode: 'percent',
    target_type: 'gram',
    target_gram: 150,
    mold_id: null,
    mold_params: {},
    quantity: 1,
    loss_type: 'preset',
    loss_value: 0,
    ingredients: { components: [{ name: '組', gramValues: { a: 100 } }], v: 1 },
    client_updated_at: new Date().toISOString(),
  }
}

let userId
try {
  // 1) 建拋棄式使用者
  const u = await sql`INSERT INTO users (name, email) VALUES ('E2E Cloud', ${'e2e-cloud-' + Math.floor(Date.now() / 1000) + '@bakemao.local'}) RETURNING id`
  userId = u[0].id
  console.log('test user id =', userId)

  // 2) 偽造 session cookie（JWT 策略，sub = userId）
  const token = await encode({
    token: { sub: String(userId), name: 'E2E Cloud' },
    secret: AUTH_SECRET,
    salt: SALT,
    maxAge: 60 * 60,
  })
  const cookie = `${SALT}=${token}`
  const H = { 'Content-Type': 'application/json', Cookie: cookie }

  // 3) 未帶 cookie → 應 401
  const unauth = await fetch(`${BASE}/api/recipes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload('x')) })
  check(unauth.status === 401, `未登入 POST 應 401（實得 ${unauth.status}）`)

  // 4) POST 新增 A
  const r1 = await fetch(`${BASE}/api/recipes`, { method: 'POST', headers: H, body: JSON.stringify(payload('E2E-A原始')) })
  const j1 = await r1.json()
  check(r1.status === 200 && j1.id, `POST 新增成功，回傳 id=${j1.id}`)
  const id1 = j1.id

  // 5) PUT 就地更新成 B
  const r2 = await fetch(`${BASE}/api/recipes/${id1}`, { method: 'PUT', headers: H, body: JSON.stringify(payload('E2E-B已更新')) })
  const j2 = await r2.json()
  check(r2.status === 200 && j2.id === id1, `PUT 更新成功，id 不變（${j2.id}）`)

  // 6) GET → 應只有 1 筆，且名稱是 B（證明更新沒新增重複）
  const g1 = await fetch(`${BASE}/api/recipes`, { headers: { Cookie: cookie } })
  const rows1 = await g1.json()
  check(Array.isArray(rows1) && rows1.length === 1, `更新後仍只有 1 筆（實得 ${rows1.length}）= 沒重複`)
  check(rows1[0]?.name === 'E2E-B已更新', `那 1 筆名稱已是「${rows1[0]?.name}」`)

  // 7) 再 POST 一筆 C → 應變 2 筆（證明「新增」確實會多一筆）
  const r3 = await fetch(`${BASE}/api/recipes`, { method: 'POST', headers: H, body: JSON.stringify(payload('E2E-C另存新')) })
  check(r3.status === 200, 'POST 另存新一筆成功')
  const g2 = await fetch(`${BASE}/api/recipes`, { headers: { Cookie: cookie } })
  const rows2 = await g2.json()
  check(rows2.length === 2, `另存後共 2 筆（實得 ${rows2.length}）`)

  // 8) 別人不能更新我的（換一個 userId 的 cookie 打 PUT id1 → 404）
  const u2 = await sql`INSERT INTO users (name, email) VALUES ('E2E Other', ${'e2e-other-' + Math.floor(Date.now() / 1000) + '@bakemao.local'}) RETURNING id`
  const otherToken = await encode({ token: { sub: String(u2[0].id) }, secret: AUTH_SECRET, salt: SALT, maxAge: 3600 })
  const r4 = await fetch(`${BASE}/api/recipes/${id1}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: `${SALT}=${otherToken}` }, body: JSON.stringify(payload('駭')) })
  check(r4.status === 404, `他人帳號 PUT 我的配方應 404（實得 ${r4.status}）= 權限隔離`)
  await sql`DELETE FROM users WHERE id = ${u2[0].id}`

  console.log('\n' + (allPass ? '🎉 全部通過' : '⚠️ 有失敗項'))
} finally {
  // 清理
  if (userId) {
    await sql`DELETE FROM recipes WHERE user_id = ${userId}`
    await sql`DELETE FROM users WHERE id = ${userId}`
    console.log('已清理測試資料')
  }
}
process.exit(allPass ? 0 : 1)
