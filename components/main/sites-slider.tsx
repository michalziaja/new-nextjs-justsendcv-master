"use client"

import { InfiniteSlider } from '@/components/motion-primitives/infinite-slider'
import Image from 'next/image'

const sites = [
  { name: 'pracuj.pl', logo: '/sites/pracuj.png' },
  { name: 'praca.pl', logo: '/sites/praca.png' },
  { name: 'linkedin.com', logo: '/sites/linkedin.png' },
  { name: 'nofluffjobs.com', logo: '/sites/nofluffjobs.png' },
  { name: 'justjoin.it', logo: '/sites/justjoin.png' },
  
  { name: 'indeed.com', logo: '/sites/indeed.jpg' },
  { name: 'gowork.pl', logo: '/sites/gowork.png' },
  { name: 'aplikuj.pl', logo: '/sites/aplikuj.png' },
  { name: 'rocketjobs.pl', logo: '/sites/rocketjobs.jpg' },
  { name: 'kwf.pl', logo: '/sites/kwf.png' },
]

export function SitesSlider() {
  return (
    <section className="relative pt-20 pb-20 overflow-hidden bg-gray-50 dark:bg-[#0A0F1C] transition-colors duration-300">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_2px),linear-gradient(to_bottom,#80808012_1px,transparent_2px)] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>
      <div className="relative container mx-auto px-24">
        <h3 className="text-center text-xl text-gray-600 dark:text-gray-200 mb-8">
          Portale z którymi współpracuje wtyczka JustSend.cv
        </h3>
        <div className="max-w-8xl mx-auto">
          <InfiniteSlider reverse gap={22}>
            {sites.map((site) => (
              <div
                key={site.name}
                className="relative h-12 w-24 transition-all"
              >
                <Image
                  src={site.logo}
                  alt={`${site.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  )
} 