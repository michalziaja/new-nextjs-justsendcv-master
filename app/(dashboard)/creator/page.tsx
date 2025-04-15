"use client";

import React, { useState, useEffect } from 'react';
import Creator from "@/components/creator/Creator";
import Preview from '@/components/creator/Preview';
import { CVProvider } from '@/components/creator/CVContext';



// Główny komponent strony
export default function CreatorPage() {
  const [showPreview, setShowPreview] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isSmallScreen = windowWidth < 1175;

  // Nasłuchiwanie na zmiany rozmiaru okna
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Automatyczne przełączanie widoku na kreator przy małych ekranach
  useEffect(() => {
    if (isSmallScreen) {
      setShowPreview(false);
    }
  }, [isSmallScreen]);

  return (
    <CVProvider>
      <div className="pb-4 lg:mt-8 xl:mt-11 md:mt-6 mt-6 mr-1 ml-0 sm:mr-4 sm:ml-3.5 md:mr-8 md:ml-7 xl:mr-15 xl:ml-15 h-[calc(100vh-7rem)] xl:h-[calc(100vh-8.5rem)]">
        {/* Układ siatki z responsywnością */}
        <div className={`grid ${isSmallScreen ? 'grid-cols-1' : 'grid-cols-2'} gap-2 max-w-[1800px] mx-auto h-full relative overflow-visible`}>
          {/* Na małych ekranach pokazujemy albo kreator albo podgląd wraz z przyciskiem przełączania */}
          {isSmallScreen ? (
            <>
              {showPreview ? <Preview switchMode={() => setShowPreview(false)} /> : <Creator switchMode={() => setShowPreview(true)} />}
            </>
          ) : (
            // Na dużych ekranach pokazujemy oba bez przycisku przełączania
            <>
              <Creator />
              <Preview />
            </>
          )}
        </div>
      </div>
    </CVProvider>
  );
}