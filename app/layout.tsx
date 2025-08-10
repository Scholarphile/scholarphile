import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

// Cache busting - forces fresh load
const timestamp = Date.now()

export const metadata: Metadata = {
  title: 'ScholarPhile - Document Sharing Community for College Students',
  description: 'A sleek, minimal document sharing platform where college students can share, discover, and collaborate on academic materials.',
  keywords: 'document sharing, college students, academic materials, study resources, collaboration',
  authors: [{ name: 'ScholarPhile Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Cache busting meta tag */}
        <meta name="cache-timestamp" content={timestamp.toString()} />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
