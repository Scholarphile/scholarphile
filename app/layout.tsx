import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
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
