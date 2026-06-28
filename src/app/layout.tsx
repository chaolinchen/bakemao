import type { Metadata, Viewport } from 'next'
import { Baloo_2, Noto_Sans_TC, Roboto_Mono } from 'next/font/google'
import Script from 'next/script'
import { Providers } from '@/components/Providers'
import { UpdatePrompt } from '@/components/UpdatePrompt'
import { ToastContainer } from '@/components/ui/ToastContainer'
import './globals.css'

const GA_ID = 'G-EHQCHQVB1M'

const baloo = Baloo_2({
  subsets: ['latin'],
  variable: '--font-baloo',
  weight: ['700', '800'],
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  weight: ['400', '600', '700'],
  display: 'swap',
})

const notoSans = Noto_Sans_TC({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  weight: ['400', '500', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://bakemao.smallfatmao.com'),
  title: 'BakeMao 烘焙貓',
  description: '烘焙配方換算、模具與耗損，換模具、算克數、多組配方，全自動。',
  manifest: '/manifest.json',
  // Beta 測試中：全站不進搜尋引擎索引，只有拿到連結者能進；之後要公開再移除此設定。
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    url: 'https://bakemao.smallfatmao.com',
    title: 'BakeMao 烘焙貓',
    description: '烘焙配方換算、模具與耗損，換模具、算克數、多組配方，全自動。',
    siteName: 'BakeMao 烘焙貓',
    locale: 'zh_TW',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BakeMao 烘焙貓',
    description: '烘焙配方換算、模具與耗損，換模具、算克數、多組配方，全自動。',
  },
}

export const viewport: Viewport = {
  themeColor: '#C8602A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-Hant">
      <body
        className={`${baloo.variable} ${robotoMono.variable} ${notoSans.variable} min-h-screen antialiased`}
        style={{ fontFamily: "'Baloo 2', 'Noto Sans TC', system-ui, sans-serif" }}
      >
        <Providers>{children}</Providers>
        <UpdatePrompt />
        <ToastContainer />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
      </body>
    </html>
  )
}
