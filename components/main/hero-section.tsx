"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
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
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-40 overflow-hidden bg-gray-50 dark:bg-[#0A0F1C] transition-colors duration-300">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_2px),linear-gradient(to_bottom,#80808012_1px,transparent_2px)] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center mb-16"
        >
          <motion.div variants={itemVariants} className="max-w-3xl">
            <motion.div
              variants={itemVariants}
              className="inline-block px-3 py-1 mb-6 rounded-full bg-[#00B2FF]/10 text-[#00B2FF] font-medium text-sm"
            >
              Powered by AI
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              <span className="text-gray-900 dark:text-white">Zmień sposób, w jaki </span>
              <span className="text-[#00B2FF]">szukasz pracy</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8"
            >
              Uprość swoje poszukiwanie pracy dzięki inteligentnym narzędziom do śledzenia
              aplikacji, tworzenia CV, przygotowania do rozmów i wsparcia AI w rozwoju kariery.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-[#00B2FF] hover:bg-[#00B2FF]/90 text-white px-8"
              >
                Rozpocznij
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 px-8"
              >
                Zobacz demo
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="relative rounded-xl overflow-hidden shadow-2xl"
          >
            <Image
              src="/table.png"
              alt="JustSend.cv Dashboard"
              width={1200}
              height={800}
              className="w-full"
              priority
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="absolute -z-10 -top-50 -right-60 w-96 h-96 bg-[#00B2FF]/8 rounded-full blur-3xl" />
            <div className="absolute -z-10 -bottom-10 -left-50 w-82 h-82 bg-[#00B2FF]/8 rounded-full blur-3xl" />
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/50 to-white/0 dark:from-[#0A0F1C]/50 dark:to-[#0A0F1C]/0" />
    </section>
  )
}

