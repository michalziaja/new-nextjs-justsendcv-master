"use client"

import { FileText, Brain, Target, Users, BarChart3, Clock, Shield, Sparkles } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, 100])

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

const features = [
  {
    icon: Brain,
    title: "Inteligentny kreator CV",
    description: "Twórz profesjonalne CV z pomocą AI. Otrzymuj spersonalizowane sugestie i optymalizuj treść.",
  },
  {
    icon: Target,
    title: "Śledzenie aplikacji",
    description: "Monitoruj status swoich aplikacji w jednym miejscu. Automatyczne powiadomienia o zmianach statusu.",
  },
  {
    icon: BarChart3,
    title: "Rozszerzone statystyki",
    description: "Analizuj skuteczność swoich aplikacji. Zobacz, które elementy CV wymagają poprawy.",
  },
  {
    icon: Sparkles,
    title: "Asystent AI",
    description: "Otrzymuj spersonalizowane porady i sugestie dotyczące procesu rekrutacji.",
  },
  {
    icon: Clock,
    title: "Oszczędność czasu",
    description: "Automatyzacja procesów aplikacyjnych pozwala zaoszczędzić czas na istotniejsze aspekty poszukiwania pracy.",
  },
  {
    icon: Shield,
    title: "Prywatność i bezpieczeństwo",
    description: "Twoje dane są bezpieczne i szyfrowane. Pełna kontrola nad udostępnianymi informacjami.",
  },
]


  return (
    <section id="features" className="relative py-20 pb-30 overflow-hidden bg-gray-50 dark:bg-[#0A0F1C] transition-colors duration-300">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_2px),linear-gradient(to_bottom,#80808012_1px,transparent_2px)] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl lg:text-6xl font-bold mb-6 bg-black dark:bg-white text-transparent bg-clip-text">
          Wszystko, czego potrzebujesz, aby
          </h2>
          <p className="text-5xl md:text-6xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
          zwiększyć swoje szanse na sukces.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="p-6 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-800 hover:border-cyan-500/50 dark:hover:border-purple-500/50 shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:shadow-purple-500/10 transition-all duration-300 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-cyan-500 after:to-transparent after:opacity-0 after:transition-opacity hover:after:opacity-100 relative"
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
            >
              <feature.icon className="w-12 h-12 text-cyan-500 dark:text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/50 to-white/0 dark:from-[#0A0F1C]/50 dark:to-[#0A0F1C]/0" />
    </section>
  )
}

