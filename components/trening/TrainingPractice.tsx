"use client";

import React from 'react';
import { JobOffer, SavedCV } from '@/types/database.types';

interface TrainingPracticeProps {
  trainingStarted: boolean;
  selectedCV: SavedCV | null;
  selectedJobOffer: JobOffer | null;
}

/**
 * Komponent treningu praktycznego rozmowy rekrutacyjnej
 * Obecnie zawiera tylko informacje o przyszłej implementacji
 */
export default function TrainingPractice({ 
  trainingStarted, 
  selectedCV, 
  selectedJobOffer 
}: TrainingPracticeProps) {
  // Połączony widok z informacjami o funkcji w trakcie budowy
  return (
    <div className="bg-white dark:bg-sidebar rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] p-6 h-full overflow-hidden">
      {/* <h2 className="text-xl font-semibold mb-4">Symulacja rozmowy rekrutacyjnej</h2> */}
      
      <div className="bg-white dark:bg-sidebar rounded-lg p-6 flex-grow flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-6">🚧</div>
        <h3 className="text-xl font-semibold mb-4">Funkcja w trakcie budowy</h3>
        <p className="dark:text-gray-400 text-gray-600 mb-6">
          Ta funkcjonalność będzie dostępna w przyszłej aktualizacji.
        </p>
        
        {/* Korzyści z treningu praktycznego */}
        <div className="bg-white dark:bg-sidebar rounded-lg p-4 border border-gray-200 dark:border-gray-600  mb-6">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Dzięki treningowi praktycznemu:</h4>
          <ul className="list-disc list-inside text-left text-sm dark:text-gray-400 text-gray-600 space-y-1">
            <li>Przećwiczysz pełną rozmowę rekrutacyjną z AI</li>
            <li>Otrzymasz natychmiastową informację zwrotną na temat swoich odpowiedzi</li>
            <li>Przygotujesz się mentalnie do rzeczywistej rozmowy</li>
            <li>Zwiększysz swoją pewność siebie przed spotkaniem z rekruterem</li>
          </ul>
        </div>
        
        {/* Co będzie dostępne */}
        <div className="bg-yellow-50 dark:bg-sidebar p-4 rounded-lg mb-6 border border-yellow-100 dark:border-yellow-600">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Co tutaj znajdziesz wkrótce:</h4>
          <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-400 text-sm text-left space-y-2">
            <li>Symulacja pełnej rozmowy rekrutacyjnej z wykorzystaniem sztucznej inteligencji</li>
            <li>Możliwość nagrywania i odtwarzania swoich odpowiedzi audio</li>
            <li>Szczegółowa ocena odpowiedzi z wskazówkami do poprawy</li>
            <li>Różne scenariusze rozmów dostosowane do branży i stanowiska</li>
            <li>Możliwość śledzenia postępów i porównywania wyników z poprzednich sesji</li>
          </ul>
        </div>
        

        
        <p className="text-sm text-gray-500 mt-6">
          Pracujemy nad udostępnieniem tej funkcji jak najszybciej. W międzyczasie zachęcamy do korzystania z modułów "Przygotowanie" i "Pytania".
        </p>
      </div>
    </div>
  );
} 