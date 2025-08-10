import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Hero } from '@/components/sections/hero'
import { Features } from '@/components/sections/features'
import { HowItWorks } from '@/components/sections/how-it-works'
import { Footer } from '@/components/layout/footer'

export default function HomePage() {
  // Cache busting timestamp
  const timestamp = Date.now()
  
  return (
    <div className="min-h-screen bg-background" data-timestamp={timestamp}>
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
