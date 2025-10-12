import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "./providers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Scholarphile - Curated Educational Videos",
  description: "Search-first learning platform with curated YouTube educational content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-gray-50"
      >
        <QueryProvider>
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                  Scholarphile
                </Link>
                <nav className="flex items-center gap-6 text-sm">
                  <Link href="/search" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Search
                  </Link>
                  <Link href="/curate" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Curate
                  </Link>
                </nav>
              </div>
            </header>
            
            <main className="flex-1">
              {children}
            </main>
            
            <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
              <div className="max-w-7xl mx-auto px-4 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} Scholarphile. All rights reserved.</p>
                <p className="mt-2">Curating the best educational content from YouTube.</p>
              </div>
            </footer>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
