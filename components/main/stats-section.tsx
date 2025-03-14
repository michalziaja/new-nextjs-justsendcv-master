"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import CountUp from "react-countup"

const stats = [
  {
    value: 70,
    label: "większa szansa na to, że program HR nie odrzuci CV",
    suffix: "%",
  },
  {
    value: 85,
    label: "większa dokładność względem wymagań oferty",
    suffix: "%",
  },
  {
    value: 3,
    label: "razy szybsze tworzenie aplikacji",
    suffix: "x",
  },
  {
    value: 12,
    label: "zaoszczędzonych godzin miesięcznie na aplikowaniu",
    suffix: "h",
  },
]

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="relative py-20 overflow-hidden bg-gray-50 dark:bg-[#0A0F1C] transition-colors duration-300" id="stats" ref={ref}>
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
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center group"
              >
                <div className="text-7xl font-bold mb-3 bg-black dark:bg-white  text-transparent bg-clip-text group-hover:scale-110 transition-transform duration-300">
                  {isInView && (
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      suffix={stat.suffix}
                    />
                  )}
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/50 to-white/0 dark:from-[#0A0F1C]/50 dark:to-[#0A0F1C]/0" />
    </section>
  )
} 