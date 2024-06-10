import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import ConvexClerkProvider from '../providers/ConvexClerkProvider'
import AudioProvider from '@/providers/AudioProvider'

const manrope = Manrope({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI 팟캐스터',
  description: 'AI로 팟캐스트 생성하기',
  icons: {
    icon: '/icons/logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ConvexClerkProvider>
      <html lang='en'>
        <AudioProvider>
          <body className={`md:overflow-hidden ${manrope.className}`}>
            {children}
          </body>
        </AudioProvider>
      </html>
    </ConvexClerkProvider>
  )
}
