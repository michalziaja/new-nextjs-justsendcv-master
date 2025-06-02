"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Download, ArrowRight, Globe, Search, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"

// Lista serwisów z ofertami pracy
const jobSites = [
  { name: "pracuj.pl", logo: "/sites/pracuj.pl.png", url: "https://pracuj.pl", description: "Największy polski portal z ofertami pracy. Tysiące ofert z różnych branż." },
  { name: "praca.pl", logo: "/sites/praca.png", url: "https://praca.pl", description: "Popularny serwis z ogłoszeniami o pracę, aktualizowany codziennie." },
  { name: "linkedin.com", logo: "/sites/linkedin.png", logoDark: "/sites/linkedin-dark.png", url: "https://linkedin.com", description: "Międzynarodowy serwis społecznościowy dla profesjonalistów." },
  { name: "nofluffjobs.com", logo: "/sites/NoFluffJobs.png", url: "https://nofluffjobs.com", description: "Portal z ofertami pracy w branży IT, z transparentnymi widełkami płacowymi." },
  { name: "justjoin.it", logo: "/sites/justjoinit.png", logoDark: "/sites/justjoinit-dark.png", url: "https://justjoin.it", description: "Portal specjalizujący się w ofertach pracy dla programistów i specjalistów IT." },
  { name: "indeed.com", logo: "/sites/indeed.png", logoDark: "/sites/indeed-dark.png", url: "https://indeed.com", description: "Globalny agregator ofert pracy z różnych źródeł." },
  { name: "gowork.pl", logo: "/sites/gowork.png", url: "https://gowork.pl", description: "Polski portal z ofertami pracy i opiniami o pracodawcach." },
  { name: "aplikuj.pl", logo: "/sites/aplikuj.png", logoDark: "/sites/aplikuj-dark.png", url: "https://aplikuj.pl", description: "Serwis z ofertami pracy i narzędziami do zarządzania aplikacjami." },
  { name: "rocketjobs.pl", logo: "/sites/rocketjobs.png", url: "https://rocketjobs.pl", description: "Nowoczesny portal z ofertami pracy głównie w branży IT." },
  { name: "kwf.pl", logo: "/sites/kwf.png", logoDark: "/sites/kwf-dark.png", url: "https://karierawfinansach.pl", description: "Specjalistyczny portal z ofertami pracy w sektorze finansowym." },
  { name: "solid.jobs", logo: "/sites/solid.png", logoDark: "/sites/solid-dark.png", url: "https://solid.jobs", description: "Portal rekrutacyjny dla programistów i specjalistów IT." },
  { name: "olx.pl", logo: "/sites/olx.png", logoDark: "/sites/olx-dark.png", url: "https://olx.pl/praca", description: "Popularny serwis ogłoszeniowy z sekcją ofert pracy." },
  { name: "nuzle.pl", logo: "/sites/nuzle.png", url: "https://nuzle.pl", description: "Platforma z ofertami pracy różnego typu." },
  { name: "infopraca.pl", logo: "/sites/infopraca.png", url: "https://infopraca.pl", description: "Polski portal rekrutacyjny z długą historią na rynku." },
  { name: "jober.pl", logo: "/sites/jober.png", url: "https://jober.pl", description: "Serwis z ogłoszeniami o pracę w różnych branżach." },
]

export function Checklist() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Card className="col-span-1 rounded-sm border-0
      shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
      dark:shadow-slate-900/20
      bg-gradient-to-r from-[#00B2FF] to-blue-600 dark:from-[#00B2FF] dark:to-blue-700">
        <CardContent className="p-2">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Ikona */}
            <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
              <Globe className="h-8 w-8 text-white" />
            </div>

            {/* Tekst */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                Przeglądaj oferty i zapisuj jednym kliknięciem
              </h2>
              <p className="text-sm text-white/80">
                Odwiedź popularne portale z ofertami i zainstaluj wtyczkę do szybkiego zapisywania
              </p>
            </div>

            {/* Przyciski */}
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              {/* Przycisk otwierający modal */}
              <Button 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-white/90 transition-all duration-200 
                  hover:scale-105 active:scale-95 font-medium flex items-center gap-2"
                onClick={() => setIsOpen(true)}
              >
                Zobacz serwisy
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              {/* Przycisk do pobrania wtyczki - zmieniony na bardziej widoczny */}
              <Button 
                variant="default"
                className="bg-yellow-400 hover:bg-yellow-300 border-2 border-white text-blue-700 
                  shadow-md transition-all duration-200 
                  hover:scale-105 active:scale-95 font-medium flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Pobierz wtyczkę
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal z listą serwisów */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Największe serwisy z ofertami pracy</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {jobSites.map((site) => (
              <div key={site.name} className="flex items-center p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <div className="relative w-12 h-12 mr-4 flex-shrink-0">
                  <Image
                    src={site.logo}
                    alt={`${site.name} logo`}
                    fill
                    className="object-contain block dark:hidden"
                  />
                  <Image
                    src={site.logoDark || site.logo}
                    alt={`${site.name} logo`}
                    fill
                    className="object-contain hidden dark:block"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-1">{site.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{site.description}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="ml-2 flex-shrink-0"
                  asChild
                >
                  <a href={site.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    <span className="hidden sm:inline">Odwiedź</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
            <p>Zapisuj oferty z tych serwisów bezpośrednio do swojego konta za pomocą wtyczki JustSend.cv</p>
            <p className="mt-1">Wszystkie oferty w jednym miejscu!</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 