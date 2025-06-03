"use client"

import { useAnimationFrame, useInView, motion } from "framer-motion"
import { Header } from "@/components/start-page/header"
import { Footer } from "@/components/start-page/footer"
import { FileText, Brain, Target, BarChart3, Clock, Shield, Sparkles, Bot, Chrome, ListTodo, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import CountUp from "react-countup"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  bulletPoints: string[]
}

interface Site {
  name: string
  logo: string
  logoDark?: string
  url: string
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

// Interfejs dla artykułów
interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  content: string;
}

// Dane dla sekcji
const features: Feature[] = [
  { icon: ListTodo, title: "Monitorowanie Aplikacji", description: "Zmiana statusów i analiza wymagań oferty." },
  { icon: Brain, title: "Kreator CV z AI", description: "Twórz profesjonalne CV z pomocą sztucznej inteligencji." },
  { icon: BarChart3, title: "Rozszerzone statystyki", description: "Analizuj skuteczność swoich aplikacji." },
  { icon: Bot, title: "Asystent AI", description: "Tworzenie wiadomości i dokumentów aplikacyjnych." },
  { icon: Target, title: "Trening", description: "Generowanie pytań dopasowanych do konkretnej oferty." },
  { icon: Chrome, title: "Wtyczka do Chrome", description: "Łatwe zapisywanie ofert pracy jednym kliknięciem." },
]

const stats: Stat[] = [
  { value: 70, label: "większa szansa na przejście HR", suffix: "%" },
  { value: 85, label: "większa dokładność", suffix: "%" },
  { value: 3, label: "szybsze tworzenie CV", suffix: "x" },
  { value: 12, label: "zaoszczędzone godziny", suffix: "h" },
]

const appFeatures: AppFeature[] = [
  {
    id: "job-tracker",
    title: "Śledzenie aplikacji",
    icon: <ListTodo className="h-5 w-5" />,
    description: "Śledź aplikacje w jednym miejscu.",
    image: "/placeholder.svg?height=600&width=800",
    bulletPoints: [
      "Przejrzysty widok wszystkich aplikacji",
      "Statusy poszczególnych etapów rekrutacji",
      "Przypomnienia o terminach rozmów i zadaniach"
    ]
  },
  {
    id: "cv-creator",
    title: "Kreator CV",
    icon: <FileText className="h-5 w-5" />,
    description: "Twórz CV z AI.",
    image: "/placeholder.svg?height=600&width=800",
    bulletPoints: [
      "Szablony CV zoptymalizowane pod ATS",
      "Sugestie treści generowane przez AI",
      "Personalizacja CV pod konkretne ogłoszenie"
    ]
  },
  {
    id: "statistics",
    title: "Statystyki",
    icon: <BarChart3 className="h-5 w-5" />,
    description: "Analizuj proces poszukiwania pracy.",
    image: "/placeholder.svg?height=600&width=800",
    bulletPoints: [
      "Analiza skuteczności Twoich aplikacji",
      "Porównanie z innymi kandydatami",
      "Insight na temat najpopularniejszych umiejętności"
    ]
  },
  {
    id: "ai-assistant",
    title: "Asystent AI",
    icon: <Bot className="h-5 w-5" />,
    description: "Generuj wiadomości i dokumenty.",
    image: "/placeholder.svg?height=600&width=800",
    bulletPoints: [
      "Automatyczne tworzenie listów motywacyjnych",
      "Profesjonalne wiadomości do rekruterów",
      "Analiza i optymalizacja treści"
    ]
  },
  {
    id: "interview-training",
    title: "Trening rozmowy",
    icon: <Target className="h-5 w-5" />,
    description: "Przygotuj się do rozmowy kwalifikacyjnej z AI.",
    image: "/placeholder.svg?height=600&width=800",
    bulletPoints: [
      "Pytania dopasowane do konkretnej oferty",
      "Symulacja rozmowy kwalifikacyjnej",
      "Feedback i sugestie usprawnień"
    ]
  },
  // {
  //   id: "browser-plugin",
  //   title: "Wtyczka",
  //   icon: <Chrome className="h-5 w-5" />,
  //   description: "Zapisuj oferty jednym kliknięciem.",
  //   image: "/placeholder.svg?height=600&width=800",
  //   bulletPoints: [
  //     "Szybki zapis ofert z portali pracy",
  //     "Automatyczne dodawanie do Twojego konta",
  //     "Powiadomienia o nowych ofertach"
  //   ]
  // },
]

const sites: Site[] = [
  { name: "pracuj.pl", logo: "/sites/pracuj.pl.png", url: "https://pracuj.pl" },
  { name: "praca.pl", logo: "/sites/praca.png", url: "https://praca.pl" },
  { name: "linkedin.com", logo: "/sites/linkedin.png", logoDark: "/sites/linkedin-dark.png", url: "https://linkedin.com" },
  { name: "nofluffjobs.com", logo: "/sites/NoFluffJobs.png", url: "https://nofluffjobs.com" },
  { name: "justjoin.it", logo: "/sites/justjoinit.png", logoDark: "/sites/justjoinit-dark.png", url: "https://justjoin.it" },
  { name: "indeed.com", logo: "/sites/indeed.png", logoDark: "/sites/indeed-dark.png", url: "https://indeed.com" },
  { name: "gowork.pl", logo: "/sites/gowork.png", url: "https://gowork.pl" },
  { name: "aplikuj.pl", logo: "/sites/aplikuj.png", logoDark: "/sites/aplikuj-dark.png", url: "https://aplikuj.pl" },
  { name: "rocketjobs.pl", logo: "/sites/rocketjobs.png", url: "https://rocketjobs.pl" },
  { name: "kwf.pl", logo: "/sites/kwf.png", logoDark: "/sites/kwf-dark.png", url: "https://karierawfinansach.pl" },
  { name: "solid.jobs", logo: "/sites/solid.png", logoDark: "/sites/solid-dark.png", url: "https://solid.jobs" },
  { name: "olx.pl", logo: "/sites/olx.png", logoDark: "/sites/olx-dark.png", url: "https://olx.pl/praca" },
  { name: "nuzle.pl", logo: "/sites/nuzle.png", url: "https://nuzle.pl" },
  { name: "infopraca.pl", logo: "/sites/infopraca.png", url: "https://infopraca.pl" },
  { name: "jober.pl", logo: "/sites/jober.png", url: "https://jober.pl" },
]

const plans: Plan[] = [
  {
    name: "Darmowy",
    price: "0",
    description: "Idealny na początek",
    features: [
      "Podstawowy kreator CV",
      "Śledzenie do 10 aplikacji",
      "Ograniczone sugestie AI",
      "Wsparcie e-mailowe",
      "1 szablon CV",
    ],
    cta: "Rozpocznij za darmo",
    popular: false,
  },
  {
    name: "Tygodniowy",
    price: "8",
    description: "Szybki dostęp do Premium",
    features: [
      "100 zapisanych ofert pracy",
      "10 szablonów CV",
      "Podstawowe statystyki",
      "Dostęp do asystenta AI",
      "Wsparcie e-mail",
      "Wtyczka do przeglądarki",
    ],
    cta: "Wybierz plan tygodniowy",
    popular: false,
  },
  {
    name: "Miesięczny",
    price: "29",
    description: "Pełny dostęp do wszystkich funkcji",
    features: [
      "100 zapisanych ofert pracy",
      "50 szablonów CV",
      "Zaawansowane statystyki",
      "Nielimitowany dostęp do asystenta AI",
      "Priorytetowe wsparcie",
      "Wtyczka do przeglądarki",
    ],
    cta: "Wybierz plan miesięczny",
    popular: true,
  },
  {
    name: "Kwartalny",
    price: "79",
    description: "Oszczędzasz 10% w porównaniu z planem miesięcznym",
    features: [
      "100 zapisanych ofert pracy",
      "50 szablonów CV",
      "Zaawansowane statystyki",
      "Nielimitowany dostęp do asystenta AI",
      "Priorytetowe wsparcie",
      "Wtyczka do przeglądarki",
      "1 miesiąc gratis",
    ],
    cta: "Wybierz plan kwartalny",
    popular: false,
  },
]

const faqs: FAQ[] = [
  {
    question: "Czym jest JustSend.cv?",
    answer:
      "JustSend.cv to kompleksowa platforma do zarządzania procesem poszukiwania pracy. Łączy w sobie narzędzia do tworzenia CV, śledzenia aplikacji oraz wsparcie sztucznej inteligencji, aby zwiększyć Twoje szanse na znalezienie wymarzonej pracy.",
  },
  {
    question: "Jak działa optymalizacja CV?",
    answer:
      "Nasza technologia AI analizuje Twoje CV pod kątem słów kluczowych, struktury i czytelności, a następnie sugeruje zmiany, które zwiększą Twoje szanse na przejście przez systemy ATS stosowane przez pracodawców. Dodatkowo, AI dostosowuje treść CV do konkretnych ofert pracy.",
  },
  {
    question: "Czy mogę testować za darmo?",
    answer:
      "Tak, oferujemy darmowy plan, który pozwala na korzystanie z podstawowych funkcji platformy bez ograniczeń czasowych. Możesz w każdej chwili przejść na plan Pro, aby odblokować wszystkie funkcje.",
  },
  {
    question: "Czy moje dane są bezpieczne?",
    answer:
      "Bezpieczeństwo Twoich danych jest naszym priorytetem. Stosujemy zaawansowane metody szyfrowania i przestrzegamy najwyższych standardów bezpieczeństwa. Twoje dane nigdy nie są udostępniane stronom trzecim bez Twojej wyraźnej zgody.",
  },
]

// Artykuły
const articles: Article[] = [
  {
    id: "art1",
    title: "Nowe trendy w rekrutacji – jak zmieniają się procesy rekrutacyjne na rynku pracy",
    excerpt: "Rynek pracy dynamicznie się zmienia, a procesy rekrutacyjne przechodzą prawdziwą rewolucję. Cyfryzacja, automatyzacja i rosnące oczekiwania kandydatów sprawiają, że zarówno firmy, jak i osoby poszukujące pracy muszą dostosowywać się do nowych realiów.",
    image: "/art/art1.jpg",
    imageAlt: "Nowe trendy w rekrutacji",
    content: "Rynek pracy dynamicznie się zmienia, a procesy rekrutacyjne przechodzą prawdziwą rewolucję. Cyfryzacja, automatyzacja i rosnące oczekiwania kandydatów sprawiają, że zarówno firmy, jak i osoby poszukujące pracy muszą dostosowywać się do nowych realiów. Odkryj, jakie trendy kształtują obecnie rekrutację i jak możesz je wykorzystać, by zwiększyć swoje szanse na sukces zawodowy.\n\nSztuczna inteligencja w rekrutacji – rewolucja dla kandydatów i pracodawców\nSztuczna inteligencja (AI) coraz częściej wspiera procesy rekrutacyjne we wszystkich branżach. Firmy wykorzystują algorytmy do analizy CV, selekcji kandydatów i dopasowywania ich do konkretnych stanowisk. Dla kandydatów oznacza to konieczność tworzenia dokumentów aplikacyjnych zoptymalizowanych pod kątem systemów ATS (Applicant Tracking System), które automatycznie skanują CV w poszukiwaniu odpowiednich słów kluczowych.\n\nNowoczesne kreatory CV z AI, takie jak JustSend.cv, pomagają w przygotowaniu dokumentów, które łatwo przechodzą przez automatyczną selekcję. Dzięki funkcjom takim jak inteligentne dopasowanie CV do oferty, personalizacja szablonów czy wsparcie AI w optymalizacji treści, kandydaci mogą znacząco zwiększyć swoje szanse na zaproszenie do kolejnych etapów rekrutacji."
  },
  {
    id: "art2",
    title: "Jak ułatwić sobie szukanie pracy – nowoczesne narzędzia dla każdego kandydata",
    excerpt: "Poszukiwanie pracy to proces, który może być stresujący i czasochłonny. Na szczęście, dzięki nowoczesnym narzędziom i aplikacjom, możesz znacząco ułatwić sobie cały proces – od tworzenia CV, przez śledzenie aplikacji, aż po przygotowanie do rozmowy kwalifikacyjnej.",
    image: "/art/art3.jpg",
    imageAlt: "Nowoczesne narzędzia do szukania pracy",
    content: "Poszukiwanie pracy to proces, który może być stresujący i czasochłonny. Na szczęście, dzięki nowoczesnym narzędziom i aplikacjom, możesz znacząco ułatwić sobie cały proces – od tworzenia CV, przez śledzenie aplikacji, aż po przygotowanie do rozmowy kwalifikacyjnej.\n\nInteligentny kreator CV z AI\nKreator CV oparty na sztucznej inteligencji to nieoceniona pomoc dla każdego, kto chce przygotować profesjonalny dokument aplikacyjny. Narzędzia takie jak JustSend.cv oferują:\n\nSzablony CV zoptymalizowane pod systemy ATS\n\nSugestie treści generowane przez AI\n\nMożliwość personalizacji CV pod konkretne ogłoszenie\n\nWsparcie w tworzeniu listu motywacyjnego i profilu zawodowego\n\nDzięki temu Twoje CV będzie nie tylko atrakcyjne wizualnie, ale także skuteczne w oczach rekruterów i systemów automatycznej selekcji."
  }
];

// Obrazy dashboardu dla carousel
const dashboardImages = [
  {
    light: "/dashboard1.png",
    dark: "/dashboard1-dark.png", // Zakładając, że masz też wersje ciemne
    alt: "JustSend.cv Dashboard - Śledzenie aplikacji"
  },
  {
    light: "/dashboard2.png", 
    dark: "/dashboard2-dark.png",
    alt: "JustSend.cv Dashboard - Kreator CV"
  },
  {
    light: "/dashboard3.png",
    dark: "/dashboard3-dark.png", 
    alt: "JustSend.cv Dashboard - Statystyki"
  },
  {
    light: "/dashboard.png",
    dark: "/dashboard4-dark.png",
    alt: "JustSend.cv Dashboard - Asystent AI"
  }
];

export default function StartPage() {
  const statsRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const appShowcaseRef = useRef<HTMLDivElement>(null)
  const sitesRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)
  const articlesRef = useRef<HTMLDivElement>(null)

  // Stan dla carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const isStatsInView = useInView(statsRef, { once: true, amount: 0.2 })
  const isHeroInView = useInView(heroRef, { once: true, amount: 0.1 })
  const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.2 })
  const isAppShowcaseInView = useInView(appShowcaseRef, { once: true, amount: 0.2 })
  const isSitesInView = useInView(sitesRef, { once: true, amount: 0.2 })
  const isPricingInView = useInView(pricingRef, { once: true, amount: 0.2 })
  const isFaqInView = useInView(faqRef, { once: true, amount: 0.2 })
  const isArticlesInView = useInView(articlesRef, { once: true, amount: 0.2 })

  // Funkcje do obsługi carousel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % dashboardImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + dashboardImages.length) % dashboardImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play carousel co 2 sekundy
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % dashboardImages.length);
    }, 4000); // 2 sekundy

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  // Funkcje do kontroli auto-play
  const pauseAutoPlay = () => setIsAutoPlay(false);
  const resumeAutoPlay = () => setIsAutoPlay(true);

  // Animacje
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  }

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  }

  const itemFadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
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
        staggerChildren: 0.1, // Dzieci (karty planów) pojawią się z opóźnieniem
      },
    },
  }

  const pricingItemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
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
            className="w-full py-24 px-4"
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
                Uprość swoje poszukiwanie pracy dzięki inteligentnym narzędziom do śledzenia aplikacji, tworzenia CV i
                wsparcia AI.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              >
                {/* Przycisk z gradientem i subtelnym efektem hover */}
                <Button className="bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white dark:text-black px-8 py-6 text-lg hover:opacity-90">
                  Rozpocznij za darmo
                </Button>
                {/* Przycisk z kontrastowym tłem */}
                <Button className="bg-black dark:bg-white text-white dark:text-black px-8 py-6 text-lg hover:bg-black/90 dark:hover:bg-white/90 !duration-0 !transition-none">
                  Zobacz demo
                </Button>
              </motion.div>

              {/* Carousel z podglądem dashboardu */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative w-full max-w-5xl mx-auto"
                onMouseEnter={pauseAutoPlay}
                onMouseLeave={resumeAutoPlay}
              >
                {/* Gradient w tle dla efektu głębi */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-sm blur-2xl transform translate-y-4" />
                
                {/* Kontener carousel z efektem rozmycia i cieniem */}
                <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-sm overflow-hidden shadow-2xl">
                  {/* Górny pasek z kropkami (jak okno aplikacji) */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-muted/90 flex items-center px-4 z-20">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    
                    {/* Wskaźniki slajdów */}
                    <div className="flex space-x-2 ml-auto">
                      {dashboardImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            goToSlide(index);
                            pauseAutoPlay();
                            // Wznów auto-play po 5 sekundach nieaktywności
                            setTimeout(resumeAutoPlay, 5000);
                          }}
                          className={cn(
                            "w-2 h-2 rounded-sm transition-all duration-300",
                            index === currentSlide 
                              ? "bg-[#00B2FF] w-6" 
                              : "bg-gray-400 hover:bg-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Kontener obrazów carousel */}
                  <div className="relative mt-8 overflow-hidden">
                    <motion.div
                      className="flex"
                      animate={{ x: `${-currentSlide * 100}%` }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      {dashboardImages.map((image, index) => (
                        <div key={index} className="w-full flex-shrink-0 relative">
                          {/* Obraz w trybie jasnym */}
                          <Image
                            src={image.light}
                            alt={image.alt}
                            width={1920}
                            height={900}
                            className="w-full h-auto rounded-sm block dark:hidden"
                          />
                          {/* Obraz w trybie ciemnym */}
                          <Image
                            src={image.dark}
                            alt={image.alt}
                            width={1920}
                            height={1080}
                            className="w-full h-auto rounded-sm hidden dark:block"
                          />
                        </div>
                      ))}
                    </motion.div>

                    {/* Przyciski nawigacji */}
                    <button
                      onClick={() => {
                        prevSlide();
                        pauseAutoPlay();
                        // Wznów auto-play po 5 sekundach nieaktywności
                        setTimeout(resumeAutoPlay, 5000);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                    </button>
                    
                    <button
                      onClick={() => {
                        nextSlide();
                        pauseAutoPlay();
                        // Wznów auto-play po 5 sekundach nieaktywności
                        setTimeout(resumeAutoPlay, 5000);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                    </button>
                  </div>

                  {/* Tytuł aktualnego slajdu */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-black/70 text-white px-4 py-2 rounded-sm text-sm font-medium">
                      {dashboardImages[currentSlide].alt}
                    </div>
                  </div>

                  {/* Wskaźnik auto-play */}
                  <div className="absolute top-10 right-4 z-10">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      isAutoPlay ? "bg-green-500" : "bg-gray-400"
                    )} />
                  </div>
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
            className="w-full py-24 px-4"
          >
            <div className="container mx-auto px-4 mt-16 mb-16">
              <div className="text-center mb-16">
                <motion.h2
                  variants={fadeInUp}
                  className="text-5xl md:text-6xl lg:text-6xl font-bold mb-2 text-gray-900 dark:text-white"
                >
                  Wszystko, czego potrzebujesz, aby
                </motion.h2>
                {/* Gradientowy tekst dla wyróżnienia */}
                <motion.p
                  variants={fadeInUp}
                  className="text-5xl md:text-6xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text"
                >
                  zwiększyć swoje szanse na sukces.
                </motion.p>
                <motion.p
                  variants={fadeInUp}
                  className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8"
                >
                  Narzędzia, które ułatwią Ci proces poszukiwania pracy
                </motion.p>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate={isFeaturesInView ? "visible" : "hidden"}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4"
              >
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={itemFadeIn}
                    className="p-6 rounded-xl bg-card dark:bg-[#0A0F1C]/50 border-2 border-gray-200 dark:border-gray-800 hover:border-[#00B2FF] hover:ring-2 hover:ring-[#00B2FF]/50 shadow-lg hover:shadow-xl hover:shadow-[#00B2FF]/10 relative"
                  >
                    {/* Header z tytułem i ikoną */}
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                      <feature.icon className="w-8 h-8 text-[#00B2FF]" />
                    </div>
                    {/* Content z opisem */}
                    <div>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
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
            className="w-full py-24 px-4"
          >
            <div className="container mx-auto px-4 mt-16 mb-16">
              <div className="text-center mb-16">
                <motion.h2
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight"
                >
                  Realne efekty i liczby
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8"
                >
                  Przekonaj się, jakie korzyści przynosi korzystanie z <span className="text-[#00B2FF]">JustSend</span><span className="text-gray-900 dark:text-white">.</span><span className="text-[#00B2FF]">cv</span>
                </motion.p>
              </div>
              
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
           {/* App Showcase - Sekcja prezentująca funkcje aplikacji w formie zakładek */}
           <motion.section 
            ref={appShowcaseRef}
            initial="hidden"
            animate={isAppShowcaseInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="w-full py-24 px-4"
          >
            <div className="container mx-auto px-4 mt-16 mb-10">
              <div className="text-center mb-10">
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
                <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-10 w-full justify-between">
                  {appFeatures.map((feature) => (
                    <TabsTrigger
                      key={feature.id}
                      value={feature.id}
                      className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00B2FF] data-[state=active]:to-blue-600 data-[state=active]:text-white"
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
                          {feature.bulletPoints.map((point, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-[#00B2FF] to-blue-600 flex items-center justify-center text-white">✓</div>
                              <span>{point}</span>
                            </li>
                          ))}
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
            className="w-full py-24 px-4"
          >
            <div className="container mx-auto px-4 mt-16 mb-16">
              <div className="text-center mb-16">
                <motion.h2
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight"
                >
                  Gdzie możesz użyć wtyczki <span className="text-[#00B2FF]">JustSend</span><span className="text-gray-900 dark:text-white">.</span><span className="text-[#00B2FF]">cv</span>
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8"
                >
                  Nasza wtyczka współpracuje z najpopularniejszymi portalami pracy
                </motion.p>

                <motion.div
                  variants={staggerContainer}
                  className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8"
                >
                  {sites.map((site) => (
                    <motion.div
                      key={site.name}
                      variants={itemFadeIn}
                      className="flex items-center justify-center group"
                    >
                      {/* Dodanie linka do strony portalu */}
                      <a 
                        href={site.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="relative h-12 w-24 transition-all transform group-hover:scale-110 duration-300 filter hover:drop-shadow-lg"
                      >
                        {/* Logo w trybie jasnym - pokazywane tylko w jasnym motywie */}
                        <Image
                          src={site.logo}
                          alt={`${site.name} logo`}
                          fill
                          className="object-contain block dark:hidden"
                        />
                        {/* Logo w trybie ciemnym - pokazywane tylko w ciemnym motywie */}
                        <Image
                          src={site.logoDark || site.logo}
                          alt={`${site.name} logo`}
                          fill
                          className="object-contain hidden dark:block"
                        />
                      </a>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.section>

           {/* Articles Section - Sekcja z artykułami */}
           <motion.section
            ref={articlesRef}
            initial="hidden"
            animate={isArticlesInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="w-full py-24 px-4"
          >
            <div className="container mx-auto px-4 mt-16 mb-16">
              <div className="text-center mb-16">
                <motion.h2
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight"
                >
                  Artykuły i porady
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                >
                  Poznaj najnowsze trendy w rekrutacji i dowiedz się, jak skutecznie poszukiwać pracy
                </motion.p>
              </div>

              {/* Główne artykuły */}
              <motion.div
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
              >
                {articles.map((article) => (
                  <motion.div
                    key={article.id}
                    variants={itemFadeIn}
                    className="bg-white dark:bg-[#0A0F1C] rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-64 w-full">
                      <Image
                        src={article.image}
                        alt={article.imageAlt}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {article.excerpt}
                      </p>
                      <Button className="bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white" asChild>
                        <a href={`/article/${article.id}`}>Czytaj więcej</a>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>

           {/* Pricing Section - Sekcja z planami cenowymi i animacją */}
           <motion.section
            ref={pricingRef}
            initial="hidden"
            animate={isPricingInView ? "visible" : "hidden"}
            variants={pricingAnimation}
            className="w-full py-24 px-4"
            id="pricing"
          >
            <div className="container mx-auto px-4 mt-16 mb-16">
              <div className="text-center mb-16">
                <motion.h2
                  variants={pricingItemAnimation}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white tracking-tight"
                >
                  Wybierz plan idealny dla Ciebie
                </motion.h2>
                <motion.p
                  variants={pricingItemAnimation}
                  className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                >
                  Zacznij za darmo lub odblokuj pełne możliwości z planem Pro.
                </motion.p>
              </div>

              <motion.div
                variants={pricingAnimation}
                initial="hidden"
                animate={isPricingInView ? "visible" : "hidden"}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
              >
                {plans.map((plan, index) => (
                  <motion.div
                    key={index}
                    variants={pricingItemAnimation}
                    className={cn(
                      "relative bg-white dark:bg-[#0A0F1C] rounded-xl shadow-lg transition-all duration-300 border h-full flex flex-col hover:-translate-y-2",
                      plan.popular
                        ? "border-[#00B2FF] lg:scale-105 z-10 shadow-xl shadow-[#00B2FF]/20 hover:shadow-2xl hover:shadow-[#00B2FF]/30 hover:border-2"
                        : "border-gray-200 dark:border-gray-800 hover:shadow-xl hover:shadow-blue-500/10 hover:border-gray-300 dark:hover:border-gray-700",
                    )}
                  >
                    {/* Wyróżnienie planu popularnego */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white px-4 py-1 rounded-md text-xs font-medium shadow-md">
                        Polecany
                      </div>
                    )}

                    <div className="flex flex-col h-full p-5">
                      {/* Nagłówek planu */}
                      <div className="text-center mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <h3
                          className={cn(
                            "text-xl font-bold mb-1.5",
                            plan.popular ? "text-[#00B2FF]" : "text-gray-900 dark:text-white",
                          )}
                        >
                          {plan.name}
                        </h3>
                        <div className="flex items-baseline justify-center gap-1 mb-2">
                          <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            {plan.price === "0" ? "" : plan.name === "Tygodniowy" ? "zł/tydz." : plan.name === "Miesięczny" ? "zł/mies." : "zł/kwartał"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{plan.description}</p>
                      </div>

                      {/* Lista funkcji */}
                      <ul className="space-y-3 mb-6 flex-grow">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div
                              className={cn(
                                "h-4 w-4 rounded-full flex items-center justify-center mt-0.5",
                                plan.popular
                                  ? "bg-[#00B2FF] text-white"
                                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                              )}
                            >
                              <Check className="h-2.5 w-2.5" />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Przycisk CTA */}
                      <Button
                        className={cn(
                          "w-full mt-auto rounded-xl py-4 text-sm font-medium transition-all duration-300",
                          plan.popular
                            ? "bg-gradient-to-r from-[#00B2FF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:shadow-[#00B2FF]/50"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gradient-to-r from-[#00B2FF] to-blue-600 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700",
                        )}
                      >
                        {plan.cta}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Dodatkowy tekst zachęcający */}
              <motion.p
                variants={pricingItemAnimation}
                className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8"
              >
                Nie jesteś pewien? Wypróbuj plan Darmowy – bez zobowiązań!
              </motion.p>
            </div>
          </motion.section>

          {/* FAQ Section - Sekcja z często zadawanymi pytaniami */}
          <motion.section
            ref={faqRef}
            initial="hidden"
            animate={isFaqInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="w-full py-24 px-4"
            id="faq"
          >
            <div className="container mx-auto px-4 mt-16 mb-16">
              <div className="text-center mb-16">
                {/* Gradientowy nagłówek dla wyróżnienia */}
                <motion.h2
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white tracking-tight bg-clip-text"
                >
                  Często zadawane pytania
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące JustSend.cv
                </motion.p>
              </div>

              <motion.div variants={fadeInUp} className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4 mb-8">
                  {faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0F1C]/80 rounded-xl overflow-hidden shadow-sm"
                    >
                      {/* Tekst z efektem hover */}
                      <AccordionTrigger className="px-6 py-4 hover:text-[#00B2FF] font-medium text-left">
                        {faq.question}
                      </AccordionTrigger>
                      {/* Tło z efektem kontrastu */}
                      <AccordionContent className="px-6 py-4 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#0A0F1C] border-t border-gray-100 dark:border-gray-800">
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

