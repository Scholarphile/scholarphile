import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/session-provider'

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
  // Force cache refresh
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Cache busting meta tag */}
        <meta name="cache-timestamp" content={timestamp.toString()} />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#ffffff',
              border: '1px solid #334155',
            },
          }}
        />
      </body>
    </html>
  )
}
