"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Interfejs dla obrazów w galerii
interface GalleryImage {
  light: string
  dark: string
}

interface RollingGalleryProps {
  images: GalleryImage[]
  autoPlay?: boolean
  duration?: number
  className?: string
}

// Komponent rolling gallery z efektem 3D coverflow
export function RollingGallery({ 
  images, 
  autoPlay = true, 
  duration = 4000,
  className 
}: RollingGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [direction, setDirection] = useState(1) // 1 = w prawo, -1 = w lewo
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Funkcja do przejścia do następnego obrazu z efektem ping-pong
  const nextImage = () => {
    setCurrentIndex((prevIndex) => {
      let newIndex = prevIndex + direction
      
      // Jeśli doszliśmy do końca idąc w prawo, zmieniamy kierunek na lewo
      if (newIndex >= images.length - 1) {
        setDirection(-1)
        return images.length - 1
      }
      
      // Jeśli doszliśmy do początku idąc w lewo, zmieniamy kierunek na prawo
      if (newIndex <= 0) {
        setDirection(1)
        return 0
      }
      
      return newIndex
    })
  }

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isHovered) {
      intervalRef.current = setInterval(nextImage, duration)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoPlay, duration, isHovered, direction, images.length])

  // Funkcja do przejścia do konkretnego obrazu
  const goToImage = (index: number) => {
    setCurrentIndex(index)
    // Reset kierunku przy ręcznym wyborze
    setDirection(1)
  }

  // Funkcja do obliczania stylu dla każdego obrazu w 3D
  const getImageStyle = (index: number) => {
    const diff = index - currentIndex
    const absOffset = Math.abs(diff)
    
    // Pozycja bazowa - aktywny obraz na środku
    let x = diff * 580 // Odległość między obrazami (powiększona 2x)
    let z = absOffset * -300 // Głębokość - dalsze obrazy idą w tył (powiększona 2x)
    let rotateY = diff * 25 // Rotacja - skrajne obrazy są obrócone
    let scale = absOffset === 0 ? 0.9 : 0.7 // Aktywny obraz większy
    let opacity = absOffset > 2 ? 0 : absOffset === 0 ? 1 : 0.6 // Ukryj bardzo odległe obrazy
    
    return {
      x,
      z,
      rotateY,
      scale,
      opacity,
    }
  }

  return (
    <div 
      className={cn("relative w-full overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Kontener 3D */}
      <div className="relative h-[450px] w-full" style={{ perspective: '2000px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {images.map((image, index) => {
            const style = getImageStyle(index)
            return (
              <motion.div
                key={index}
                className="absolute cursor-pointer"
                style={{
                  transformStyle: 'preserve-3d',
                }}
                animate={style}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                onClick={() => goToImage(index)}
              >
                <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-white/20" style={{ width: '720px', height: '360px' }}>
                  {/* Obraz w trybie jasnym */}
                  <Image
                    src={image.light}
                    alt=""
                    fill
                    className="object-contain block dark:hidden"
                    priority={index === 0}
                  />
                  {/* Obraz w trybie ciemnym */}
                  <Image
                    src={image.dark}
                    alt=""
                    fill
                    className="object-contain hidden dark:block"
                    priority={index === 0}
                  />
                  
                  {/* Overlay dla nieaktywnych obrazów */}
                  {index !== currentIndex && (
                    <div className="absolute inset-0 bg-black/40" />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Wskaźniki kropek */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300 border-2",
              index === currentIndex 
                ? "bg-[#00B2FF] border-[#00B2FF] scale-125" 
                : "bg-white/50 border-white/50 hover:bg-white/75 hover:border-white/75"
            )}
          />
        ))}
      </div>
    </div>
  )
} 