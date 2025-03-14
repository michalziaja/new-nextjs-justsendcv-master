"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useRef } from "react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

const faqs = [
  {
    question: "Czym jest JustSend.cv?",
    answer: "JustSend.cv to kompleksowa platforma do zarządzania procesem poszukiwania pracy, która wykorzystuje sztuczną inteligencję do optymalizacji CV i zwiększenia szans na znalezienie wymarzonej pracy.",
  },
  {
    question: "Jak działa optymalizacja CV przez AI?",
    answer: "Nasz system AI analizuje treść Twojego CV pod kątem konkretnych ofert pracy, sugerując zmiany w słowach kluczowych, strukturze i zawartości, aby lepiej dopasować dokument do wymagań rekruterów.",
  },
  {
    question: "Czy mogę testować za darmo?",
    answer: "Tak, oferujemy darmowy plan z podstawowymi funkcjami oraz 14-dniowy okres próbny dla planów płatnych, abyś mógł w pełni przetestować wszystkie funkcje przed podjęciem decyzji.",
  },
  {
    question: "Czy moje dane są bezpieczne?",
    answer: "Bezpieczeństwo danych jest naszym priorytetem. Stosujemy zaawansowane metody szyfrowania i przestrzegamy najwyższych standardów ochrony danych osobowych zgodnie z RODO.",
  },
  {
    question: "Jak działa śledzenie aplikacji?",
    answer: "System automatycznie śledzi status Twoich aplikacji, zapisuje historię kontaktów, przypomina o follow-upach i generuje raporty z postępów w poszukiwaniu pracy.",
  },
]

export function FaqSection() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gray-50 dark:bg-[#0A0F1C] transition-colors duration-300" id="faq" ref={ref}>
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_2px),linear-gradient(to_bottom,#80808012_1px,transparent_2px)] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
            Często zadawane pytania
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące JustSend.cv
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                >
                  <AccordionTrigger className="px-6 text-gray-900 dark:text-white hover:text-blue-400">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/50 to-white/0 dark:from-[#0A0F1C]/50 dark:to-[#0A0F1C]/0" />
    </section>
  )
}

