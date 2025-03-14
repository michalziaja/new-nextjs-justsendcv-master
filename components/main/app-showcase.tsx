"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, FileText, ListTodo, Bot, Chrome } from "lucide-react"


export function AppShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, 100])

  const features = [
    {
      id: "job-tracker",
      title: "Śledzenie aplikacji",
      icon: <ListTodo className="h-5 w-5" />,
      description:
        "Śledź wszystkie swoje aplikacje o pracę w jednym miejscu. Uzyskaj informacje o statusie aplikacji i przypomnienia o kontynuacji.",
      image: "/placeholder.svg?height=600&width=800",
    },
    {
      id: "cv-creator",
      title: "Kreator CV",
      icon: <FileText className="h-5 w-5" />,
      description: "Twórz profesjonalne CV dostosowane do konkretnych ofert pracy z optymalizacją opartą na AI.",
      image: "/placeholder.svg?height=600&width=800",
    },
    {
      id: "statistics",
      title: "Statystyki",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Uzyskaj szczegółowe informacje o procesie poszukiwania pracy dzięki wizualnym analizom i raportom.",
      image: "/placeholder.svg?height=600&width=800",
    },
    {
      id: "ai-assistant",
      title: "Asystent AI",
      icon: <Bot className="h-5 w-5" />,
      description:
        "Otrzymuj spersonalizowane porady i sugestie, aby ulepszyć swoje aplikacje o pracę i przygotowanie do rozmowy kwalifikacyjnej.",
      image: "/placeholder.svg?height=600&width=800",
    },
    {
      id: "browser-plugin",
      title: "Wtyczka do przeglądarki",
      icon: <Chrome className="h-5 w-5" />,
      description: "Zapisuj oferty pracy z wielu portali jednym kliknięciem za pomocą naszego rozszerzenia Chrome.",
      
    },
  ]

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gray-50 dark:bg-[#0A0F1C] transition-colors duration-300" id="app-showcase" ref={ref}>
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_2px),linear-gradient(to_bottom,#80808012_1px,transparent_2px)] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div style={{ opacity, y }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-1 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-purple-500 dark:to-cyan-500 text-transparent bg-clip-text">
            <span className="text-gray-900 dark:text-white">Kompleksowa platforma</span>
            </h2>    
            <span className="text-[#00B2FF] text-4xl md:text-5xl lg:text-7xl font-bold mb-">do poszukiwania pracy</span>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-4">
            Odkryj potężne funkcje, które odmienią Twoje doświadczenie w poszukiwaniu pracy
          </p>
        </motion.div>

        <Tabs defaultValue="job-tracker" className="w-full max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
            {features.map((feature) => (
              <TabsTrigger
                key={feature.id}
                value={feature.id}
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-blue-500 dark:data-[state=active]:from-cyan-400 dark:data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                {feature.icon}
                <span className="hidden md:inline">{feature.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {features.map((feature) => (
            <TabsContent key={feature.id} value={feature.id} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-purple-500 dark:to-cyan-500 flex items-center justify-center text-white">
                        ✓
                      </div>
                      <span>Łatwy w użyciu interfejs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-purple-500 dark:to-cyan-500 flex items-center justify-center text-white">
                        ✓
                      </div>
                      <span>Optymalizacja oparta na AI</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-purple-500 dark:to-cyan-500 flex items-center justify-center text-white">
                        ✓
                      </div>
                      <span>Aktualizacje w czasie rzeczywistym</span>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  {feature.image ? (
                    feature.image
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 dark:from-purple-500/20 dark:to-cyan-500/20 rounded-xl blur-xl"></div>
                      <Image
                        src={feature.image || "/placeholder.svg"}
                        alt={feature.title}
                        width={800}
                        height={600}
                        className="rounded-xl shadow-lg relative z-10"
                      />
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/50 to-white/0 dark:from-[#0A0F1C]/50 dark:to-[#0A0F1C]/0" />
    </section>
  )
}

