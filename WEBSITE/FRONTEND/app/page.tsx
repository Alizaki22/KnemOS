import { Navbar } from '@/components/ui/Navbar'
import { Hero } from '@/components/sections/Hero'
import { Stats } from '@/components/sections/Stats'
import { Solution } from '@/components/sections/Solution'
import { Features } from '@/components/sections/Features'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { DownloadCTA } from '@/components/sections/DownloadCTA'
import { Footer } from '@/components/sections/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Stats />
      <Solution />
      <Features />
      <HowItWorks />
      <DownloadCTA />
      <Footer />
    </main>
  )
}

