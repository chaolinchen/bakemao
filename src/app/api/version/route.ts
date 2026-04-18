import { NextResponse } from 'next/server'

export const runtime = 'edge'

export function GET() {
  return NextResponse.json({
    service: 'bakemao',
    version: process.env.npm_package_version ?? 'unknown',
    commit: (process.env.VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 7),
    deployedAt: process.env.VERCEL_GIT_COMMIT_DATE ?? null,
  })
}
