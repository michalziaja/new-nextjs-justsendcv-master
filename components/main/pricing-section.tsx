"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GlowEffect } from "@/components/motion-primitives/glow-effect"

const plans = [
  {
    name: "Darmowy",
    price: "0",
    description: "Idealny na początek",
    features: [
      "Podstawowy kreator CV",
      "Śledzenie aplikacji (do 10 aplikacji)",
      "Ograniczone sugestie AI",
      "Wsparcie e-mailowe",
    ],
    cta: "Wybierz Plan",
    popular: false,
  },
  {
    name: "Pro",
    price: "79",
    description: "Najlepszy dla aktywnie poszukujących pracy",
    features: [
      "Zaawansowany kreator CV z optymalizacją AI",
      "Nieograniczone śledzenie aplikacji",
      "Pełny dostęp do asystenta AI",
      "Rozszerzenie przeglądarki",
      "Szczegółowe statystyki",
      "Priorytetowe wsparcie",
    ],
    cta: "Wybierz Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "199",
    description: "Dla zespołów i organizacji",
    features: [
      "Wszystko z planu Pro",
      "Współpraca zespołowa",
      "Własny branding",
      "Dostęp do API",
      "Dedykowany opiekun konta",
      "Wsparcie telefoniczne 24/7",
    ],
    cta: "Wybierz Pro+",
    popular: false,
  },
]

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="relative py-20 overflow-hidden bg-gray-50 dark:bg-[#0A0F1C] transition-colors duration-300" id="pricing" ref={ref}>
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_2px),linear-gradient(to_bottom,#80808012_1px,transparent_2px)] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {/* <span className="block text-gray-900 dark:text-white mb-2">Proste, przejrzyste</span> */}
            {/* <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-400 dark:to-purple-500 text-transparent bg-clip-text">ceny</span> */}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Wybierz plan, który odpowiada Twoim potrzebom. Lub wypróbuj za darmo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: plan.popular ? -20 : -10,
                transition: { duration: 0.2 }
              }}
              className={cn(
                "relative bg-gray-50 dark:bg-gray-900/50 rounded-xl p-8 shadow-xl group cursor-pointer transition-all duration-300 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-cyan-500 after:to-transparent after:opacity-0 after:transition-opacity hover:after:opacity-100",
                plan.popular 
                  ? "ring-2 ring-cyan-500 dark:ring-purple-500 shadow-cyan-500/10 dark:shadow-purple-500/10 hover:shadow-2xl hover:shadow-cyan-500/30 dark:hover:shadow-purple-500/30 scale-105" 
                  : "ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:shadow-purple-500/10 hover:scale-102",
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-400 dark:to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg shadow-cyan-500/20 dark:shadow-purple-500/20">
                  Najpopularniejszy
                </div>
              )}
              {plan.popular ? (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  {/* <GlowEffect
                    colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
                    mode="colorShift"
                    blur="softest"
                    duration={4}
                  /> */}
                </div>
              ) : null}
              <div className="relative z-10 h-full flex flex-col">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-bold">zł</span>
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">/mies.</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-cyan-500 dark:text-cyan-400 mr-2 shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "w-full relative mt-auto bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-400 dark:to-purple-500 hover:opacity-90 transition-all duration-300 group/button overflow-hidden",
                  )}
                >
                  <div className="absolute inset-0 opacity-0 group-hover/button:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-400 dark:to-purple-500 animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
                  </div>
                  <span className="relative z-10">{plan.cta}</span>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

