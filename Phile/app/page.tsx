import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Hero } from '@/components/sections/hero'
import { Features } from '@/components/sections/features'
import { HowItWorks } from '@/components/sections/how-it-works'
import { Footer } from '@/components/layout/footer'

export default function HomePage() {
  // Aggressive cache busting with random timestamp
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(7)
  
  return (
    <div className="min-h-screen bg-background" data-timestamp={timestamp} data-random={randomId}>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
