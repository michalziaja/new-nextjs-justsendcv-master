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
    cta: "Rozpocznij",
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
    cta: "Skontaktuj się",
    popular: false,
  },
]

export default function PricingSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50" id="pricing" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-purple-500 dark:to-cyan-400 text-transparent bg-clip-text">
            Proste, przejrzyste ceny
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Wybierz plan, który odpowiada Twoim potrzebom. Wszystkie plany zawierają 14-dniowy okres próbny.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "relative bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg group",
                plan.popular ? "ring-2 ring-cyan-500 dark:ring-purple-500" : "",
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-purple-500 dark:to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Najpopularniejszy
                </div>
              )}
              {plan.popular ? (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <GlowEffect
                    colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
                    mode="colorShift"
                    blur="medium"
                    duration={4}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 dark:from-purple-500/20 dark:to-cyan-500/20 rounded-xl blur-xl"></div>
              )}
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-bold">zł</span>
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">/mies.</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-cyan-500 dark:text-cyan-400 mr-2 shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "w-full",
                    plan.popular
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-purple-500 dark:to-cyan-500 hover:opacity-90 transition-opacity"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
                  )}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

