import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  cacheStartUrl: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: { cacheName: 'google-fonts', expiration: { maxEntries: 20 } },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: { cacheName: 'next-app-shell', expiration: { maxEntries: 200 } },
    },
    {
      urlPattern: /\/_next\/data\/.*/i,
      handler: 'CacheFirst',
      options: { cacheName: 'next-data', expiration: { maxEntries: 50 } },
    },
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 32 },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 部署時把 commit SHA 烘進前端 bundle，供 PWA 偵測「主畫面 App 是否還在跑舊版」
  env: {
    NEXT_PUBLIC_COMMIT: process.env.VERCEL_GIT_COMMIT_SHA ?? '',
  },
  // Beta：全站 X-Robots-Tag noindex（連 API/非 HTML 回應都擋）。只擋搜尋收錄，不影響有連結者開啟。
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
    ]
  },
}

export default withPWA(nextConfig)
