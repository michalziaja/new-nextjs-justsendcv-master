"use client"

import { useAnimationFrame, useInView, motion } from "framer-motion"
import { Header } from "@/components/start-page/header"
import { Footer } from "@/components/start-page/footer"
import { FileText, Brain, Target, BarChart3, Clock, Shield, Sparkles, Bot, Chrome, ListTodo, Check } from "lucide-react"
import { useRef } from "react"
import CountUp from "react-countup"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import React from "react"

// Definicje typów
interface Feature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

interface Stat {
  value: number
  label: string
  suffix: string
}

interface AppFeature {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  image: string
}

interface Site {
  name: string
  logo: string
}

interface Plan {
  name: string
  price: string
  description: string
  features: string[]
  cta: string
  popular: boolean
}

interface FAQ {
  question: string
  answer: string
}

// Dane dla sekcji
const features: Feature[] = [
  { icon: Brain, title: "Inteligentny kreator CV", description: "Twórz profesjonalne CV z pomocą AI." },
  { icon: Target, title: "Śledzenie aplikacji", description: "Monitoruj status swoich aplikacji." },
  { icon: BarChart3, title: "Rozszerzone statystyki", description: "Analizuj skuteczność aplikacji." },
  { icon: Sparkles, title: "Asystent AI", description: "Otrzymuj porady od AI." },
  { icon: Clock, title: "Oszczędność czasu", description: "Automatyzacja procesów aplikacyjnych." },
  { icon: Shield, title: "Prywatność i bezpieczeństwo", description: "Twoje dane są bezpieczne." },
]

const stats: Stat[] = [
  { value: 70, label: "większa szansa na przejście HR", suffix: "%" },
  { value: 85, label: "większa dokładność", suffix: "%" },
  { value: 3, label: "szybsze tworzenie", suffix: "x" },
  { value: 12, label: "zaoszczędzone godziny", suffix: "h" },
]

const appFeatures: AppFeature[] = [
  { id: "job-tracker", title: "Śledzenie aplikacji", icon: <ListTodo className="h-5 w-5" />, description: "Śledź aplikacje w jednym miejscu.", image: "/placeholder.svg?height=600&width=800" },
  { id: "cv-creator", title: "Kreator CV", icon: <FileText className="h-5 w-5" />, description: "Twórz CV z AI.", image: "/placeholder.svg?height=600&width=800" },
  { id: "statistics", title: "Statystyki", icon: <BarChart3 className="h-5 w-5" />, description: "Analizuj proces poszukiwania pracy.", image: "/placeholder.svg?height=600&width=800" },
  { id: "ai-assistant", title: "Asystent AI", icon: <Bot className="h-5 w-5" />, description: "Porady od AI.", image: "/placeholder.svg?height=600&width=800" },
  { id: "browser-plugin", title: "Wtyczka do przeglądarki", icon: <Chrome className="h-5 w-5" />, description: "Zapisuj oferty jednym kliknięciem.", image: "/placeholder.svg?height=600&width=800" },
]

const sites: Site[] = [
  { name: "pracuj.pl", logo: "/sites/pracuj.png" },
  { name: "praca.pl", logo: "/sites/praca.png" },
  { name: "linkedin.com", logo: "/sites/linkedin.png" },
  { name: "nofluffjobs.com", logo: "/sites/nofluffjobs.png" },
  { name: "justjoin.it", logo: "/sites/justjoin.png" },
  { name: "indeed.com", logo: "/sites/indeed.jpg" },
  { name: "gowork.pl", logo: "/sites/gowork.png" },
  { name: "aplikuj.pl", logo: "/sites/aplikuj.png" },
  { name: "rocketjobs.pl", logo: "/sites/rocketjobs.jpg" },
  { name: "kwf.pl", logo: "/sites/kwf.png" },
]

const plans: Plan[] = [
  { name: "Darmowy", price: "0", description: "Idealny na początek", features: ["Podstawowy kreator CV", "Śledzenie do 10 aplikacji", "Ograniczone sugestie AI", "Wsparcie e-mailowe"], cta: "Wybierz Plan", popular: false },
  { name: "Pro", price: "79", description: "Dla aktywnych", features: ["Zaawansowany kreator CV", "Nieograniczone śledzenie", "Pełny dostęp do asystenta AI", "Pełny dostęp do asystenta AI"], cta: "Wybierz Pro", popular: true },
  { name: "Enterprise", price: "199", description: "Dla zespołów", features: ["Zaawansowany kreator CV", "Nieograniczone śledzenie", "Pełny dostęp do asystenta AI", "Pełny dostęp do asystenta AI"], cta: "Wybierz Pro+", popular: false },
]

const faqs: FAQ[] = [
  { question: "Czym jest JustSend.cv?", answer: "Platforma do zarządzania poszukiwaniem pracy." },
  { question: "Jak działa optymalizacja CV?", answer: "AI analizuje i sugeruje zmiany." },
  { question: "Czy mogę testować za darmo?", answer: "Tak, oferujemy darmowy plan." },
  { question: "Czy moje dane są bezpieczne?", answer: "Tak, stosujemy szyfrowanie." },
]

// Komponent InfiniteSlider (bez zmian)
function InfiniteSlider({ children, reverse, gap = 24 }: { children: React.ReactNode; reverse?: boolean; gap?: number }) {
  const [loopCount] = React.useState(2)
  const speed = reverse ? 3 : -3
  const contentRef = React.useRef<HTMLDivElement>(null)
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const [start, setStart] = React.useState(false)
  const [contentWidth, setContentWidth] = React.useState(0)

  React.useEffect(() => {
    if (!contentRef.current) return
    setContentWidth(contentRef.current.offsetWidth)
  }, [])

  React.useEffect(() => {
    setStart(true)
  }, [])

  useAnimationFrame((time, delta) => {
    if (!scrollerRef.current || !start || !contentWidth) return

    const scrollLeft = scrollerRef.current.scrollLeft
    let newScrollLeft = scrollLeft + (delta * speed) / 16
    if (newScrollLeft <= 0) {
      newScrollLeft = newScrollLeft + (contentWidth + gap)
    } else if (newScrollLeft >= contentWidth + gap) {
      newScrollLeft = newScrollLeft - (contentWidth + gap)
    }

    scrollerRef.current.scrollLeft = newScrollLeft
  })

  return (
    <div className="scroller relative max-w-full overflow-hidden" ref={scrollerRef}>
      <div ref={contentRef} className="flex min-w-full shrink-0 gap-4 py-4" style={{ gap: `${gap}px` }}>
        {[...Array(loopCount)].map((_, i) => (
          <div key={i} className="flex shrink-0 items-center gap-4" style={{ gap: `${gap}px` }}>
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StartPage() {
  const statsRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const appShowcaseRef = useRef<HTMLDivElement>(null)
  const sitesRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)

  const isStatsInView = useInView(statsRef, { once: true, amount: 0.2 })
  const isHeroInView = useInView(heroRef, { once: true, amount: 0.1 })
  const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.2 })
  const isAppShowcaseInView = useInView(appShowcaseRef, { once: true, amount: 0.2 })
  const isSitesInView = useInView(sitesRef, { once: true, amount: 0.2 })
  const isPricingInView = useInView(pricingRef, { once: true, amount: 0.2 })
  const isFaqInView = useInView(faqRef, { once: true, amount: 0.2 })

  // Animacje
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  }

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  }

  const itemFadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  }

  // Animacja dla Pricing Section
  const pricingAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1 // Dzieci (karty planów) pojawią się z opóźnieniem
      } 
    }
  }

  const pricingItemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-50/30 via-gray-100 to-cyan-50/30 text-foreground dark:from-[#0A0F1C] dark:via-[#1A2338] dark:to-gray-900 relative">
      {/* Tło z subtelnym efektem siatki i dekoracjami */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Siatka w tle - subtelny wzór linii dla tekstury */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808011_1px,transparent_1px),linear-gradient(to_bottom,#80808011_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
        {/* Subtelne koło w lewym górnym rogu - dekoracyjny akcent */}
        {/* <div className="absolute top-80 left-30 w-32 h-32 rounded-full bg-gray-100/30 dark:bg-cyan-500/10 blur-3xl" /> */}
        {/* Subtelne koło w prawym dolnym rogu - dekoracyjny akcent */}
        <div className="absolute top-30 right-20 w-40 h-40 rounded-full bg-gray-100 dark:bg-blue-500/10 blur-3xl" />
        {/* Linia pozioma w górnej części - subtelny separator */}
        <div className="absolute top-48 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-cyan-600/80 to-transparent dark:via-cyan-500/30" />
        {/* Linia pozioma w dolnej części - subtelny separator */}
        <div className="absolute bottom-50 right-0 w-1/3 h-px bg-gradient-to-l from-transparent via-cyan-500/80 to-transparent dark:via-cyan-500/30" />
        
      </div>

      <div className="relative z-10">
        <Header />
        
        <main className="flex flex-col items-center">
          {/* Hero Section - Główna sekcja powitalna z logo, nagłówkiem i przyciskami */}
          <motion.section 
            ref={heroRef}
            initial="hidden"
            animate={isHeroInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="w-full py-32 px-4"
          >
            <div className="container mx-auto text-center max-w-4xl mt-16 mb-16">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="flex items-center justify-center gap-3 mb-8"
              >
                {/* Logo z cieniem i efektem skalowania przy najechaniu */}
               
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
                <span className="text-gray-900 dark:text-white">Zmień sposób, w jaki </span>
                  {/* Tekst z cieniem dla kontrastu */}
                  <span className="text-[#00B2FF] drop-shadow-md">szukasz pracy</span>
              </h1>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8"
              >
                Uprość swoje poszukiwanie pracy dzięki inteligentnym narzędziom do śledzenia aplikacji, tworzenia CV i wsparcia AI.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              >
                {/* Przycisk z gradientem i subtelnym efektem hover */}
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-6 text-lg hover:opacity-90">
                  Rozpocznij za darmo
                </Button>
                {/* Przycisk z kontrastowym tłem */}
                <Button className="bg-black dark:bg-white text-white dark:text-black px-8 py-6 text-lg hover:bg-black/90 dark:hover:bg-white/90 !duration-0 !transition-none">
                  Zobacz demo
                </Button>
              </motion.div>

              {/* Podgląd dashboardu z cieniem i gradientem w tle */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative w-full max-w-5xl mx-auto"
              >
                {/* Gradient w tle dla efektu głębi */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-2xl transform translate-y-4" />
                {/* Kontener z efektem rozmycia i cieniem */}
                <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 right-0 h-8 bg-muted/90 flex items-center px-4">
                    {/* Dekoracyjne kropki przypominające okno aplikacji */}
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <Image
                    src="/dashboard.png"
                    alt="JustSend.cv Dashboard Preview"
                    width={1920}
                    height={1080}
                    className="w-full h-auto rounded-b-xl mt-8 block dark:hidden"
                  />
                  <Image
                    src="/dashboard-dark.png"
                    alt="JustSend.cv Dashboard Preview"
                    width={1920}
                    height={1080}
                    className="w-full h-auto rounded-b-xl mt-8 hidden dark:block"
                  />
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Features Section - Sekcja prezentująca kluczowe funkcje */}
          <motion.section 
            ref={featuresRef}
            initial="hidden"
            animate={isFeaturesInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="w-full py-24"
          >
            <div className="container mx-auto px-4 mt-8 mb-16">
              <div className="text-center mb-16">
                <motion.h2 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                  Wszystko, czego potrzebujesz, aby
                </motion.h2>
                {/* Gradientowy tekst dla wyróżnienia */}
                <motion.p variants={fadeInUp} className="text-5xl md:text-6xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
                  zwiększyć swoje szanse na sukces.
                </motion.p>
              </div>

              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate={isFeaturesInView ? "visible" : "hidden"}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8"
              >
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={itemFadeIn}
                    className="p-6 rounded-xl bg-card dark:bg-[#0A0F1C]/50 border-2 border-gray-200 dark:border-gray-800 hover:border-[#00B2FF] hover:ring-2 hover:ring-[#00B2FF]/50 shadow-lg hover:shadow-xl hover:shadow-[#00B2FF]/10 relative"
                  >
                    {/* Ikona z akcentem kolorystycznym */}
                    <feature.icon className="w-12 h-12 text-[#00B2FF] mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* Stats Section - Sekcja z liczbami i statystykami */}
          <motion.section 
            ref={statsRef}
            initial="hidden"
            animate={isStatsInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="w-full py-24"
          >
            <div className="container mx-auto px-4 mb-16">
              <div className="max-w-6xl mx-auto">
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate={isStatsInView ? "visible" : "hidden"}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8"
                >
                  {stats.map((stat, index) => (
                    <motion.div key={index} variants={itemFadeIn} className="text-center group">
                      {/* Liczba z efektem skalowania przy najechaniu */}
                      <div className="text-7xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">
                        {isStatsInView && <CountUp end={stat.value} duration={2.5} suffix={stat.suffix} />}
                      </div>
                      <p className="text-lg text-gray-500">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* App Showcase - Sekcja prezentująca funkcje aplikacji w formie zakładek */}
          <motion.section 
            ref={appShowcaseRef}
            initial="hidden"
            animate={isAppShowcaseInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="w-full py-24"
          >
            <div className="container mx-auto px-4 mb-16">
              <div className="text-center mb-16">
                <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-7xl font-bold mb-1">
                  <span className="text-gray-900 dark:text-white">Kompleksowa platforma</span>
                  <br />
                  {/* Tekst z cieniem dla efektu */}
                  <span className="text-[#00B2FF] drop-shadow-md">do poszukiwania pracy</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-4">
                  Odkryj potężne funkcje, które odmienią Twoje doświadczenie w poszukiwaniu pracy
                </motion.p>
              </div>

              <motion.div variants={fadeInUp}>
              <Tabs defaultValue="job-tracker" className="w-full max-w-5xl mx-auto">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
                  {appFeatures.map((feature) => (
                    <TabsTrigger
                      key={feature.id}
                      value={feature.id}
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
                    >
                      {feature.icon}
                      <span className="hidden md:inline">{feature.title}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {appFeatures.map((feature) => (
                  <TabsContent key={feature.id} value={feature.id} className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{feature.description}</p>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center gap-2">
                              {/* Okrąg z gradientem jako znacznik listy */}
                              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-[#00B2FF] to-blue-600 flex items-center justify-center text-white">✓</div>
                            <span>Łatwy w użyciu interfejs</span>
                          </li>
                          <li className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-[#00B2FF] to-blue-600 flex items-center justify-center text-white">✓</div>
                            <span>Optymalizacja oparta na AI</span>
                          </li>
                          <li className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-[#00B2FF] to-blue-600 flex items-center justify-center text-white">✓</div>
                            <span>Aktualizacje w czasie rzeczywistym</span>
                          </li>
                        </ul>
                      </div>
                      <div className="relative">
                          {/* Gradient w tle obrazu dla efektu głębi */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[#00B2FF]/20 to-blue-500/20 rounded-xl blur-xl" />
                          {/* Obraz z cieniem */}
                          <Image src={feature.image} alt={feature.title} width={800} height={600} className="rounded-xl shadow-lg relative z-10" />
                        </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              </motion.div>
            </div>
          </motion.section>

          {/* Sites Slider - Sekcja z przesuwanymi logo portali */}
          <motion.section 
            ref={sitesRef}
            initial="hidden"
            animate={isSitesInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="w-full py-24"
          >
            <div className="container mx-auto px-4 mb-16">
              <div className="text-center mb-16">
                <motion.h3 variants={fadeInUp} className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  Portale z którymi współpracuje wtyczka JustSend.cv
                </motion.h3>
                <motion.div variants={fadeInUp} className="max-w-6xl mx-auto">
                  <InfiniteSlider reverse gap={22}>
                    {sites.map((site) => (
                      <div key={site.name} className="relative h-12 w-24 transition-all">
                        <Image src={site.logo} alt={`${site.name} logo`} fill className="object-contain" />
                      </div>
                    ))}
                  </InfiniteSlider>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Pricing Section - Sekcja z planami cenowymi i animacją */}
          <motion.section 
            ref={pricingRef}
            initial="hidden"
            animate={isPricingInView ? "visible" : "hidden"}
            variants={pricingAnimation} // Dodana animacja dla całej sekcji
            className="w-full py-24"
          >
            <div className="container mx-auto px-4 mb-16">
              <div className="text-center mb-16">
                <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                  Proste, przejrzyste ceny
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Wybierz plan, który odpowiada Twoim potrzebom. Lub wypróbuj za darmo.
                </motion.p>
              </div>

              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate={isPricingInView ? "visible" : "hidden"}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              >
                {plans.map((plan, index) => (
                  <motion.div
                    key={index}
                    variants={pricingItemAnimation} // Animacja dla każdej karty
                    className={cn(
                      "relative bg-white dark:bg-[#0A0F1C] rounded-xl p-8 shadow-xl group cursor-pointer transition-colors duration-300 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#00B2FF] after:to-transparent after:opacity-0 after:transition-opacity hover:after:opacity-100",
                      plan.popular 
                        ? "ring-2 ring-[#00B2FF] shadow-[#00B2FF]/10 hover:shadow-2xl hover:shadow-[#00B2FF]/30 scale-105" 
                        : "ring-1 ring-gray-500 dark:ring-gray-700 hover:shadow-xl hover:shadow-[#00B2FF]/10 dark:hover:shadow-[#00B2FF]/5 hover:scale-102"
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg shadow-[#00B2FF]/20 dark:shadow-[#00B2FF]/10">
                        Najpopularniejszy
                      </div>
                    )}
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{plan.name}</h3>
                        <div className="flex items-center justify-center text-gray-900 dark:text-white">
                          <span className="text-3xl font-bold">zł</span>
                          <span className="text-5xl font-bold">{plan.price}</span>
                          <span className="text-gray-500 dark:text-gray-400 ml-1">/mies.</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>
                      </div>

                      <ul className="space-y-3 mb-8 flex-grow">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="h-5 w-5 text-[#00B2FF] mr-2 shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={cn(
                          "w-full relative mt-auto bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white hover:opacity-90 transition-all duration-300 group/button overflow-hidden",
                        )}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover/button:opacity-100 transition-opacity duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#00B2FF] to-blue-600 animate-pulse"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
                        </div>
                        <span className="relative z-10">{plan.cta}</span>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* FAQ Section - Sekcja z często zadawanymi pytaniami */}
          <motion.section 
            ref={faqRef}
            initial="hidden"
            animate={isFaqInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="w-full py-24"
          >
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                {/* Gradientowy nagłówek dla wyróżnienia */}
                <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#00B2FF] to-cyan-400 text-transparent bg-clip-text">
                  Często zadawane pytania
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-gray-400 max-w-2xl mx-auto">
                  Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące JustSend.cv
                </motion.p>
              </div>

              <motion.div variants={fadeInUp} className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4 mb-8">
                  {faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border border-gray-200 dark:border-gray-800 bg-card rounded-lg overflow-hidden"
                    >
                      {/* Tekst z efektem hover */}
                      <AccordionTrigger className="px-6 hover:text-[#00B2FF] border-b border-gray-200 dark:border-gray-800">
                        {faq.question}
                      </AccordionTrigger>
                      {/* Tło z efektem kontrastu */}
                      <AccordionContent className="px-6 py-4 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-[#0A0F1C]/50">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            </div>
          </motion.section>
        </main>

        <Footer />
      </div>
    </div>
  )
}