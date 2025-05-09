"use client";

import React, { useState } from 'react';
import { JobOffer, SavedCV } from '@/types/database.types';
import { useTrainingData } from './TrainingDataProvider';

interface TrainingPreparationProps {
  trainingStarted: boolean;
  selectedCV: SavedCV | null;
  selectedJobOffer: JobOffer | null;
}

// Interfejs dla wyników wyszukiwania
interface SearchResults {
  companyInfo: string;
  employeeReviews: string;
  salaryInfo: string;
  competitorsSimilarities?: string;
  isLoading: boolean;
  groundingLinks?: { url: string, text: string }[];
  saved?: boolean;
}

export default function TrainingPreparation({ trainingStarted, selectedCV, selectedJobOffer }: TrainingPreparationProps) {
  // Stan dla aktywnej zakładki
  const [activeTab, setActiveTab] = useState<'company' | 'reviews' | 'salary' | 'competitors'>('company');
  
  const { searchResults } = useTrainingData();

  // Renderowanie zakładek
  const renderTabs = () => {
    return (
      <div className="border-b border-gray-200 mb-2">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center w-full">
          <li className="flex-1">
            <button
              className={`inline-block p-2 w-full ${
                activeTab === 'company'
                  ? 'text-blue-600 border-b-2 border-blue-600 active'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('company')}
            >
              Informacje o firmie
            </button>
          </li>
          <li className="flex-1">
            <button
              className={`inline-block p-2 w-full ${
                activeTab === 'reviews'
                  ? 'text-blue-600 border-b-2 border-blue-600 active'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              Opinie pracowników
            </button>
          </li>
          <li className="flex-1">
            <button
              className={`inline-block p-2 w-full ${
                activeTab === 'salary'
                  ? 'text-blue-600 border-b-2 border-blue-600 active'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('salary')}
            >
              Wynagrodzenia
            </button>
          </li>
          <li className="flex-1">
            <button
              className={`inline-block p-2 w-full ${
                activeTab === 'competitors'
                  ? 'text-blue-600 border-b-2 border-blue-600 active'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('competitors')}
            >
              Podobne firmy
            </button>
          </li>
        </ul>
      </div>
    );
  };

  // Funkcja pomocnicza do formatowania tekstu
  const formatText = (text: string) => {
    if (!text) return null;
    
    // Usuwanie znaczników markdown (gwiazdki)
    const cleanedText = text.replace(/\*\*(.*?)\*\*/g, '$1');
    
    // Dzielenie na paragrafy i formatowanie wypunktowań
    return cleanedText.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      
      // Sprawdź, czy linia jest wypunktowaniem
      if (trimmedLine.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 mb-1">
            {trimmedLine.substring(2)}
          </li>
        );
      } else if (trimmedLine.startsWith('• ')) {
        return (
          <li key={index} className="ml-4 mb-1">
            {trimmedLine.substring(2)}
          </li>
        );
      } 
      // Sprawdź czy jest to lista numerowana
      else if (/^\d+\.\s/.test(trimmedLine)) {
        const numberMatch = trimmedLine.match(/^\d+/);
        if (numberMatch) {
          const number = numberMatch[0];
          return (
            <div key={index} className="ml-2 mb-1 flex">
              <span className="mr-1 font-medium">{number}.</span>
              <span>{trimmedLine.substring(number.length + 1).trim()}</span>
            </div>
          );
        }
      }
      // Sprawdź czy jest to nagłówek
      else if (trimmedLine.match(/^[A-ZŁŚĆŹŻĘĄŃ][a-ząćęłńóśźż\s\-:]+:$/)) {
        return <h4 key={index} className="font-medium mt-2 mb-1">{trimmedLine}</h4>;
      }
      // Zwykły tekst
      else if (trimmedLine) {
        return <p key={index} className="mb-2">{trimmedLine}</p>;
      } else {
        return null;
      }
      
      // Domyślny przypadek, jeśli żaden z warunków nie zostanie spełniony
      return <p key={index} className="mb-2">{trimmedLine}</p>;
    });
  };

  // Renderowanie zawartości aktywnej zakładki
  const renderTabContent = () => {
    if (searchResults.isLoading) {
      return (
        <div className="flex flex-col  items-center justify-center h-48 py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-gray-600">Wyszukiwanie informacji o firmie {selectedJobOffer?.company}...</p>
          <p className="text-sm text-gray-500 mt-1">To może potrwać kilka sekund</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'company':
        return (
          <div className="bg-gray-50 rounded-lg mt-2 p-3 border border-gray-200 max-h-[calc(40vh)] overflow-y-auto">
            <div className="text-gray-700 text-md">
              {formatText(searchResults.companyInfo)}
            </div>
          </div>
        );
      case 'reviews':
        return (
          <div className="bg-gray-50 rounded-lg mt-2 p-3 border border-gray-200 max-h-[calc(40vh)] overflow-y-auto">
            <div className="text-gray-700 text-md">
              {formatText(searchResults.employeeReviews)}
            </div>
          </div>
        );
      case 'salary':
        return (
          <div className="bg-gray-50 rounded-lg mt-2 p-3 border border-gray-200 max-h-[calc(50vh)] overflow-y-auto">
            <div className="text-gray-700 text-md">
              {formatText(searchResults.salaryInfo)}
            </div>
          </div>
        );
      case 'competitors':
        return (
          <div className="bg-gray-50 rounded-lg mt-2 p-3 border border-gray-200 max-h-[calc(40vh)] overflow-y-auto">
            <div className="text-gray-700 text-md">
              {formatText(searchResults.competitorsSimilarities || "Brak informacji o konkurencji i podobnych firmach.")}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Jeśli trening nie został rozpoczęty, pokazujemy pusty ekran
  if (!trainingStarted) {
    return (
      <div
        className="bg-white rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] p-6 h-full overflow-hidden"
      >
        <div className="bg-white rounded-lg p-6 h-full flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-6">🎓</div>
          <h2 className="text-xl font-semibold mb-4">Przygotuj się do rozmowy rekrutacyjnej</h2>
          <p className="text-gray-600 mb-6">
            Wybierz ofertę pracy, aby rozpocząć przygotowania do rozmowy.
          </p>
          <div className="text-sm text-gray-500">
            <p>Dzięki naszemu treningowi:</p>
            <ul className="list-disc list-inside text-left mt-2 space-y-1">
              <li>Poznasz informacje o firmie przed rozmową</li>
              <li>Przeanalizujesz informacje o wynagrodzeniach i opiniach pracowników</li>
              <li>Poznasz konkurencję firmy i jej pozycję na rynku</li>
              <li>Zwiększysz swoje szanse na sukces podczas rozmowy</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-sm shadow-md p-5 h-full overflow-hidden flex flex-col"
    >
      {/* <h2 className="text-xl font-semibold mb-2">Poznaj firmę przed rozmową</h2> */}
      
      {selectedJobOffer && (
        <div className="bg-blue-50 text-blue-800 rounded-lg p-3 mb-4 text-sm">
          <div>
            <p><strong>Oferta:</strong> {selectedJobOffer.title} - {selectedJobOffer.company}</p>
          </div>
        </div>
      )}
              
      <div className="bg-white rounded-sm p-4 flex-grow flex flex-col overflow-hidden">
        {/* Zakładki */}
        {renderTabs()}
        
        {/* Zawartość zakładek */}
        <div className="flex-grow overflow-auto">
          {renderTabContent()}
        </div>
        
        {/* Linki do źródeł i wskazówki */}
        <div className="mt-1">
          {searchResults.groundingLinks && searchResults.groundingLinks.length > 0 && (
            <div className="bg-white rounded-lg p-2 border border-gray-200 mb-2">
              <h4 className="font-medium text-gray-700 text-xs mb-1">Źródła:</h4>
              <div className="flex flex-wrap gap-1">
                {searchResults.groundingLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded-full text-xs"
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-1 text-xs">Wskazówki:</h4>
            <ul className="list-disc text-xs list-inside text-yellow-700 space-y-0.5">
              <li>Zapoznaj się dokładnie z informacjami o firmie przed rozmową</li>
              <li>Przygotuj przykłady pytań dla rekrutera na podstawie tych informacji</li>
              <li>Przemyśl dopasowanie Twoich umiejętności do kultury i potrzeb firmy</li>
              <li>Przeanalizuj opinie pracowników, aby lepiej zrozumieć środowisko pracy</li>
              <li>Zanotuj kluczowe informacje przed rozmową rekrutacyjną</li>
            </ul>
          </div>
          
          <div className="text-xs text-gray-500 italic mt-1 text-center">
            <p>Informacje wygenerowane przez Gemini AI na podstawie publicznie dostępnych danych.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 