"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Clock, User, Calendar } from "lucide-react"

// Dane artykułu
const article = {
  id: "art1",
  title: "Nowe trendy w rekrutacji – jak zmieniają się procesy rekrutacyjne na rynku pracy",
  excerpt: "Rynek pracy dynamicznie się zmienia, a procesy rekrutacyjne przechodzą prawdziwą rewolucję. Cyfryzacja, automatyzacja i rosnące oczekiwania kandydatów sprawiają, że zarówno firmy, jak i osoby poszukujące pracy muszą dostosowywać się do nowych realiów.",
  image: "/art/art1.jpg",
  imageAlt: "Nowe trendy w rekrutacji",
  secondImage: "/art/art2.jpeg",
  secondImageAlt: "Sztuczna inteligencja w procesie rekrutacji",
  readTime: "5 min",
  date: "10 maja 2025",
  author: "Zespół JustSend.cv",
  tags: ["rekrutacja", "AI", "trendy", "ATS", "CV"]
}

// Animacje
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

export default function Article1() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-50/30 via-gray-100 to-cyan-50/30 text-foreground dark:from-[#0A0F1C] dark:via-[#1A2338] dark:to-gray-900 relative">
      {/* Tło z dekoracjami */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808011_1px,transparent_1px),linear-gradient(to_bottom,#80808011_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
        <div className="absolute top-30 right-20 w-40 h-40 rounded-full bg-gray-100 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute top-48 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-cyan-600/80 to-transparent dark:via-cyan-500/30" />
        <div className="absolute bottom-50 right-0 w-1/3 h-px bg-gradient-to-l from-transparent via-cyan-500/80 to-transparent dark:via-cyan-500/30" />
      </div>

      <div className="relative z-10 mt-10">
        <main className="flex flex-col items-center">
          {/* Nagłówek artykułu */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="w-full py-24 px-4"
          >
            <div className="container mx-auto">
              {/* Główny nagłówek */}
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="bg-[#00B2FF] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Trendy
                  </span>
                  <div className="flex items-center gap-6 ml-2">
                    <span className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {article.date}
                    </span>
                    <span className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <User className="h-4 w-4 mr-1" />
                      {article.author}
                    </span>
                    <span className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {article.readTime}
                    </span>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                  {article.title}
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              {/* Główne zdjęcie */}
              <div className="relative h-[400px] w-full max-w-4xl mx-auto mb-12 rounded-xl overflow-hidden shadow-xl">
                <Image
                  src={article.image}
                  alt={article.imageAlt}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* Treść artykułu */}
              <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-strong:text-gray-800 dark:prose-strong:text-gray-200 prose-img:rounded-xl prose-img:shadow-lg">
                <p>
                  Rynek pracy dynamicznie się zmienia, a procesy rekrutacyjne przechodzą prawdziwą rewolucję. Cyfryzacja, automatyzacja i rosnące oczekiwania kandydatów sprawiają, że zarówno firmy, jak i osoby poszukujące pracy muszą dostosowywać się do nowych realiów. Odkryj, jakie trendy kształtują obecnie rekrutację i jak możesz je wykorzystać, by zwiększyć swoje szanse na sukces zawodowy.
                </p>
                
                <h2 className="text-2xl font-bold text-[#00B2FF] mt-8 mb-4">
                  Sztuczna inteligencja w rekrutacji – rewolucja dla kandydatów i pracodawców
                </h2>
                
                <p>
                  <strong>Sztuczna inteligencja (AI)</strong> coraz częściej wspiera procesy rekrutacyjne we wszystkich branżach. Firmy wykorzystują algorytmy do analizy CV, selekcji kandydatów i dopasowywania ich do konkretnych stanowisk. Dla kandydatów oznacza to konieczność tworzenia dokumentów aplikacyjnych zoptymalizowanych pod kątem systemów ATS (Applicant Tracking System), które automatycznie skanują CV w poszukiwaniu odpowiednich słów kluczowych.
                </p>
                
                <p>
                  Nowoczesne kreatory CV z AI, takie jak <strong>JustSend.cv</strong>, pomagają w przygotowaniu dokumentów, które łatwo przechodzą przez automatyczną selekcję. Dzięki funkcjom takim jak inteligentne dopasowanie CV do oferty, personalizacja szablonów czy wsparcie AI w optymalizacji treści, kandydaci mogą znacząco zwiększyć swoje szanse na zaproszenie do kolejnych etapów rekrutacji.
                </p>

                <div className="relative h-64 md:h-80 w-full my-10 rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src={article.secondImage}
                    alt={article.secondImageAlt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <p className="text-white text-lg font-medium">
                      AI rewolucjonizuje procesy rekrutacyjne, wspierając zarówno kandydatów jak i rekruterów
                    </p>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-[#00B2FF] mt-8 mb-4">
                  Rekrutacja zdalna i hybrydowa – nowy standard
                </h2>
                
                <p>
                  <strong>Pandemia przyspieszyła cyfrową transformację</strong>, a rekrutacja zdalna i hybrydowa stały się codziennością w wielu branżach. Dzięki narzędziom do wideorozmów, testów online i zdalnej oceny kompetencji, firmy mogą skutecznie rekrutować kandydatów z różnych lokalizacji. Kandydaci powinni być przygotowani do udziału w rozmowach online, zadbać o profesjonalne CV oraz korzystać z narzędzi do śledzenia statusu aplikacji.
                </p>
                
                <h2 className="text-2xl font-bold text-[#00B2FF] mt-8 mb-4">
                  Rosnące znaczenie umiejętności miękkich
                </h2>
                
                <p>
                  Niezależnie od branży, pracodawcy coraz częściej zwracają uwagę na <strong>kompetencje miękkie</strong> – komunikatywność, umiejętność pracy w zespole, adaptację do zmian czy kreatywność. Kandydaci powinni nie tylko prezentować swoje umiejętności techniczne, ale także podkreślać doświadczenia związane z rozwojem osobistym i współpracą z innymi.
                </p>
                
                <h2 className="text-2xl font-bold text-[#00B2FF] mt-8 mb-4">
                  Personalizacja i indywidualne podejście
                </h2>
                
                <p>
                  Rekrutacja staje się coraz bardziej <strong>spersonalizowana</strong>. Firmy szukają kandydatów dopasowanych nie tylko do wymagań stanowiska, ale także do kultury organizacyjnej. Narzędzia takie jak JustSend.cv umożliwiają kandydatom śledzenie statusu aplikacji, analizę skuteczności działań i lepsze przygotowanie się do rozmów rekrutacyjnych.
                </p>
                
                <h2 className="text-2xl font-bold text-[#00B2FF] mt-8 mb-4">
                  Well-being i elastyczność – przewaga pracodawców
                </h2>
                
                <p>
                  Pracownicy coraz częściej oczekują <strong>elastycznych warunków pracy</strong>, wsparcia dla work-life balance i benefitów pozapłacowych. Firmy, które odpowiadają na te potrzeby, zyskują przewagę w walce o najlepszych kandydatów.
                </p>
                
                <div className="bg-[#00B2FF]/10 p-6 rounded-xl border border-[#00B2FF]/20 my-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Nowość: Trening AI – przygotuj się do rozmowy jak profesjonalista
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-0">
                    JustSend.cv wprowadza innowacyjną funkcję treningu, która pozwala kandydatom jeszcze lepiej przygotować się do rozmów rekrutacyjnych. AI analizuje ogłoszenie o pracę, wyszukuje informacje o firmie – w tym opinie pracowników – i na tej podstawie generuje listę pytań, które mogą paść podczas rozmowy kwalifikacyjnej. Dzięki temu użytkownik zyskuje przewagę, znając potencjalne tematy i mogąc lepiej dopasować swoje odpowiedzi do oczekiwań rekrutera.
                  </p>
                </div>
                
                <h2 className="text-2xl font-bold text-[#00B2FF] mt-8 mb-4">
                  Podsumowanie
                </h2>
                
                <p>
                  Nowoczesna rekrutacja to połączenie technologii, personalizacji i kompetencji miękkich. Kandydaci, którzy korzystają z inteligentnych narzędzi, optymalizują swoje CV i przygotowują się do rozmów z pomocą AI, mają znacznie większe szanse na sukces – niezależnie od branży.
                </p>
              </div>

              {/* Tagi i udostępnianie */}
              <div className="max-w-4xl mx-auto mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
                <div className="flex flex-wrap justify-between items-center">
                  <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                    {article.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Button variant="ghost" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#00B2FF]" asChild>
                    <Link href="/">
                      <ArrowLeft className="h-4 w-4" />
                      Powrót do strony głównej
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  )
} 