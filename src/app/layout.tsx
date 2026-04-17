import type { Metadata, Viewport } from 'next'
import {
  DM_Mono,
  Noto_Sans_TC,
  Noto_Serif_TC,
  Playfair_Display,
} from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
  display: 'swap',
})

const notoSans = Noto_Sans_TC({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  weight: ['400', '500'],
  display: 'swap',
})

const notoSerif = Noto_Serif_TC({
  subsets: ['latin'],
  variable: '--font-noto-serif',
  weight: ['400', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BakeMao 烘焙貓',
  description: '烘焙配方換算、模具與耗損',
  manifest: '/manifest.json',
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
        className={`${playfair.variable} ${dmMono.variable} ${notoSans.variable} ${notoSerif.variable} min-h-screen antialiased`}
        style={{
          fontFamily: 'var(--font-noto-sans), system-ui, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  )
}
