import { HeroSection } from "@/components/main/hero-section"
import { FeaturesSection } from "@/components/main/features-section"
import { PricingSection } from "@/components/main/pricing-section"
import { FaqSection } from "@/components/main/faq-section"
import { AppShowcase } from "@/components/main/app-showcase"
import { Header } from "@/components/main/header"
import { Footer } from "@/components/main/footer"
import { StatsSection } from "@/components/main/stats-section"
import { SitesSlider } from "@/components/main/sites-slider"
export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0F1C] transition-colors duration-300">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      
      <AppShowcase />
      <SitesSlider />
      <PricingSection />
      <FaqSection />
      <Footer />
    </main>
  )
}
