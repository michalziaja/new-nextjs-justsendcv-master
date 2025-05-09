"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Clock, User, Calendar, CheckCircle } from "lucide-react"

// Dane artykułu
const article = {
  id: "art2",
  title: "Jak ułatwić sobie szukanie pracy – nowoczesne narzędzia dla każdego kandydata",
  excerpt: "Poszukiwanie pracy to proces, który może być stresujący i czasochłonny. Na szczęście, dzięki nowoczesnym narzędziom i aplikacjom, możesz znacząco ułatwić sobie cały proces – od tworzenia CV, przez śledzenie aplikacji, aż po przygotowanie do rozmowy kwalifikacyjnej.",
  image: "/art/art3.jpg",
  imageAlt: "Nowoczesne narzędzia do szukania pracy",
  secondImage: "/art/art4.jpg",
  secondImageAlt: "Cyfrowe narzędzia rekrutacyjne",
  readTime: "4 min",
  date: "5 października 2023",
  author: "Zespół JustSend.cv",
  tags: ["narzędzia", "aplikacje", "CV", "rekrutacja", "efektywność"]
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

export default function Article2() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-50/30 via-gray-100 to-cyan-50/30 text-foreground dark:from-[#0A0F1C] dark:via-[#1A2338] dark:to-gray-900 relative">
      {/* Tło z dekoracjami */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808011_1px,transparent_1px),linear-gradient(to_bottom,#80808011_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
        <div className="absolute top-30 right-20 w-40 h-40 rounded-full bg-gray-100 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute top-48 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-cyan-600/80 to-transparent dark:via-cyan-500/30" />
        <div className="absolute bottom-50 right-0 w-1/3 h-px bg-gradient-to-l from-transparent via-cyan-500/80 to-transparent dark:via-cyan-500/30" />
      </div>

      <div className="relative z-10">
        <main className="flex flex-col items-center">
          {/* Nagłówek artykułu */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="w-full py-24 px-4"
          >
            <div className="container mx-auto">
              {/* Nawigacja powrotu */}
              <div className="mb-8">
                <Button variant="ghost" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#00B2FF]" asChild>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                    Powrót do strony głównej
                  </Link>
                </Button>
              </div>

              {/* Główny nagłówek */}
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="bg-[#00B2FF] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Narzędzia
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
                  Poszukiwanie pracy to proces, który może być stresujący i czasochłonny. Na szczęście, dzięki nowoczesnym narzędziom i aplikacjom, możesz znacząco ułatwić sobie cały proces – od tworzenia CV, przez śledzenie aplikacji, aż po przygotowanie do rozmowy kwalifikacyjnej.
                </p>
                
                <h2 className="text-2xl font-bold text-[#00B2FF] mt-8 mb-4">
                  Inteligentny kreator CV z AI
                </h2>
                
                <p>
                  Kreator CV oparty na sztucznej inteligencji to nieoceniona pomoc dla każdego, kto chce przygotować profesjonalny dokument aplikacyjny. Narzędzia takie jak <strong>JustSend.cv</strong> oferują:
                </p>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Szablony CV zoptymalizowane pod systemy ATS</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Sugestie treści generowane przez AI</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Możliwość personalizacji CV pod konkretne ogłoszenie</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Wsparcie w tworzeniu listu motywacyjnego i profilu zawodowego</span>
                  </li>
                </ul>
                
                <p>
                  Dzięki temu Twoje CV będzie nie tylko atrakcyjne wizualnie, ale także skuteczne w oczach rekruterów i systemów automatycznej selekcji.
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
                      Nowoczesne narzędzia cyfrowe zmieniają sposób, w jaki szukamy pracy
                    </p>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-[#00B2FF] mt-8 mb-4">
                  Aplikacja do śledzenia statusu aplikacji
                </h2>
                
                <p>
                  Jednym z największych wyzwań podczas poszukiwania pracy jest zarządzanie wieloma aplikacjami jednocześnie. <strong>Aplikacja do śledzenia statusów</strong> pomaga utrzymać porządek i kontrolę nad całym procesem:
                </p>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Przejrzysty widok wszystkich złożonych aplikacji</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Statusy poszczególnych etapów rekrutacji</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Przypomnienia o terminach rozmów i działaniach follow-up</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Możliwość dodawania notatek i załączników do każdej aplikacji</span>
                  </li>
                </ul>
                
                <h2 className="text-2xl font-bold text-[#00B2FF] mt-8 mb-4">
                  Wtyczka do przeglądarki
                </h2>
                
                <p>
                  <strong>Wtyczka do przeglądarki</strong> znacząco przyspiesza proces aplikowania. Dzięki niej możesz:
                </p>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Zapisywać oferty pracy jednym kliknięciem</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Automatycznie przenosić dane ogłoszenia do swojego systemu</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Otrzymywać powiadomienia o nowych ofertach pasujących do Twojego profilu</span>
                  </li>
                </ul>
                
                <div className="bg-[#00B2FF]/10 p-6 rounded-xl border border-[#00B2FF]/20 my-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Nowoczesne statystyki i analityka
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-0">
                    JustSend.cv dostarcza zaawansowane statystyki, które pomagają zrozumieć skuteczność Twoich aplikacji. Dzięki nim dowiesz się, które elementy CV przyciągają największą uwagę rekruterów, jakie branże najczęściej odpowiadają na Twoje aplikacje oraz jak wypadasz na tle innych kandydatów. Te dane pozwalają na ciągłe doskonalenie strategii poszukiwania pracy.
                  </p>
                </div>
                
                <h2 className="text-2xl font-bold text-[#00B2FF] mt-8 mb-4">
                  Asystent AI do przygotowania do rozmowy kwalifikacyjnej
                </h2>
                
                <p>
                  <strong>Asystent AI</strong> pomaga przygotować się do rozmowy kwalifikacyjnej poprzez:
                </p>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Generowanie potencjalnych pytań na podstawie ogłoszenia o pracę</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Symulację rozmowy kwalifikacyjnej</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Analizę odpowiedzi i sugestie usprawnień</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#00B2FF] mr-2 mt-1" />
                    <span>Informacje o firmie i kulturze organizacyjnej</span>
                  </li>
                </ul>
                
                <h2 className="text-2xl font-bold text-[#00B2FF] mt-8 mb-4">
                  Podsumowanie
                </h2>
                
                <p>
                  Korzystanie z nowoczesnych narzędzi do poszukiwania pracy może znacząco zwiększyć Twoje szanse na znalezienie wymarzonego stanowiska. Dzięki platformom takim jak JustSend.cv, możesz zautomatyzować wiele czasochłonnych zadań, poprawić jakość swoich dokumentów aplikacyjnych i lepiej przygotować się do rozmów kwalifikacyjnych.
                </p>
                
                <p>
                  Pamiętaj, że nawet najlepsze narzędzia nie zastąpią Twojego zaangażowania i proaktywnego podejścia do poszukiwania pracy. Traktuj je jako wsparcie, które pozwoli Ci zaoszczędzić czas i energię, którą możesz poświęcić na rozwijanie umiejętności i budowanie sieci kontaktów zawodowych.
                </p>
              </div>

              {/* Tagi i udostępnianie */}
              <div className="max-w-4xl mx-auto mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
                <div className="flex flex-wrap gap-2 mb-8">
                  {article.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  )
} 