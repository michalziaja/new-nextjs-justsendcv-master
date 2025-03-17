"use client"
import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, X } from "lucide-react"

export function Footer() {
  return (
    <footer className="mx-3 mb-0 rounded-md border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1C]/80 backdrop-blur-md shadow-lg pt-8 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid dla dużych ekranów */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Logo i social media - zawsze w pierwszym rzędzie */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo.png"
                alt="Logo JustSend.cv"
                width={40}
                height={40}
              />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 via-blue-400 to-blue-500 dark:from-cyan-500 dark:via-to-blue-400 dark:to-blue-500 text-transparent bg-clip-text">
                JustSend.cv
              </span>
            </Link>
            <div className="flex space-x-4 mt-4 ml-4">
              <Link href="#" className="text-gray-500 hover:text-cyan-500 dark:hover:text-cyan-400">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-cyan-500 dark:hover:text-cyan-400">
                <X className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-cyan-500 dark:hover:text-cyan-400">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-cyan-500 dark:hover:text-cyan-400">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Kontener dla Produkt i Dokumenty */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <h3 className="font-bold text-lg mb-4">Produkt</h3>
              <ul className="space-y-2 text-center">
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                  >
                    Cennik
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                  >
                    Funkcje
                  </Link>
                </li>
                
              </ul>
            </div>

            <div className="flex flex-col items-center">
              <h3 className="font-bold text-lg mb-4">Dokumenty</h3>
              <ul className="space-y-2 text-center">
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                  >
                    Polityka prywatności
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                  >
                    Warunki korzystania
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stopka z prawami autorskimi */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-5">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} JustSend.cv. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  )
}