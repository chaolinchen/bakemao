import type { Metadata, Viewport } from 'next'
import { Baloo_2, Noto_Sans_TC, Roboto_Mono } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { ToastContainer } from '@/components/ui/ToastContainer'
import './globals.css'

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
        className={`${baloo.variable} ${robotoMono.variable} ${notoSans.variable} min-h-screen antialiased`}
        style={{ fontFamily: "'Baloo 2', 'Noto Sans TC', system-ui, sans-serif" }}
      >
        <Providers>{children}</Providers>
        <ToastContainer />
      </body>
    </html>
  )
}
