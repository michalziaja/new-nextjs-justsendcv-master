"use client";

import React from 'react';
import { ClipboardList, HelpCircle, Target } from "lucide-react";
import { useTrainingData } from './TrainingDataProvider';
import { JobOffer, SavedCV } from '@/types/database.types';

// Niestandardowe style dla cienkich scrollbari
const scrollbarStyles = {
  /* Webkit browsers (Chrome, Safari, Edge) */
  '&::WebkitScrollbar': {
    width: '4px',
  },
  '&::WebkitScrollbarTrack': {
    background: 'transparent',
  },
  '&::WebkitScrollbarThumb': {
    background: '#d1d5db',
    borderRadius: '2px',
  },
  '&::WebkitScrollbarThumb:hover': {
    background: '#9ca3af',
  },
  /* Firefox */
  scrollbarWidth: 'thin',
  scrollbarColor: '#d1d5db transparent',
} as React.CSSProperties;

interface TrainingSelectionProps {
  onTrainingSelect: (type: string | null) => void;
  onStartTraining: (cv: SavedCV, jobOffer: JobOffer) => void;
  isGeneratingQuestions?: boolean;
  selectedTrainingType: string | null;
}

export default function TrainingSelection({ 
  onTrainingSelect, 
  onStartTraining, 
  isGeneratingQuestions = false, 
  selectedTrainingType 
}: TrainingSelectionProps) {
  const [selectedCV, setSelectedCV] = React.useState<string>("");
  const [selectedOffer, setSelectedOffer] = React.useState<string>("");

  const { 
    savedCVs,
    jobOffers,
    isLoading
  } = useTrainingData();

  // Style dla statusów
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'saved': return 'bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white'
      case 'applied': 
      case 'send': return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
      case 'contact': 
      case 'kontakt': return 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white'
      case 'interview': 
      case 'rozmowa': return 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white'
      case 'offer': 
      case 'oferta': return 'bg-gradient-to-r from-green-500 to-green-700 text-white'
      case 'rejected': 
      case 'odmowa': return 'bg-gradient-to-r from-red-500 to-red-700 text-white'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-700 text-white'
    }
  }

  // Mapowanie statusów EN->PL
  const statusMap: Record<string, string> = {
    saved: 'zapisana',
    applied: 'aplikowano',
    interview: 'rozmowa',
    offer: 'oferta',
    rejected: 'odrzucono',
    accepted: 'zaakceptowano',
    expired: 'wygasła'
  };

  // Kolory priorytetu
  const getPriorityColor = (value: number) => {
    switch (value) {
      case 1: return 'text-green-500'
      case 2: return 'text-yellow-500'
      case 3: return 'text-orange-500'
      case 4: return 'text-red-400'
      case 5: return 'text-red-600'
      default: return 'text-gray-400'
    }
  }

  // Renderowanie informacji o treningu
  const renderTrainingInfo = () => {
    if (selectedTrainingType === null) {
      return (
        <div className="dark:text-gray-400   text-gray-600">
          <h3 className="text-lg text-gray-800 dark:text-gray-200 font-medium mb-2 -mt-2">Jak działa trening?</h3>
          <p className="mb-4 text-sm">Wybierz jeden z trzech typów treningu, aby rozpocząć przygotowania do rozmowy rekrutacyjnej:</p>
          <ul className="list-disc text-xs list-inside space-y-2">
            <li><span className="font-medium">Przygotowanie</span> - poznaj kluczowe informacje o firmie przed rozmową. Zbierzemy dla Ciebie dane o historii firmy, kulturze organizacyjnej i wartościach, które pomogą Ci lepiej zrozumieć potencjalnego pracodawcę.</li>
            <li><span className="font-medium">Pytania</span> - przećwicz odpowiedzi na typowe pytania rekrutacyjne. Na podstawie Twojego CV i wybranej oferty, wygenerujemy zestaw spersonalizowanych pytań, które mogą pojawić się podczas rozmowy.</li>
            <li><span className="font-medium">Praktyka</span> - weź udział w symulacji rozmowy z AI. Przeprowadzimy pełną symulację rozmowy kwalifikacyjnej, która pomoże Ci oswoić się z sytuacją i lepiej przygotować do prawdziwego spotkania z rekruterem.</li>
          </ul>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-sidebar border border-blue-100 dark:border-blue-600 rounded text-xs text-blue-700 dark:text-blue-400 italic">
            Kliknij na wybrany typ treningu, aby rozpocząć przygotowania. Możesz przechodzić między różnymi typami w dowolnej kolejności.
          </div>
        </div>
      );
    } else if (selectedTrainingType === 'preparation') {
      return (
        <div className="dark:text-gray-400 text-gray-600">
          <h3 className="text-lg text-gray-800 dark:text-gray-200 font-medium mb-2 -mt-2">Przygotowanie do rozmowy</h3>
          <p className="mb-4 text-sm">Poznaj kluczowe informacje o firmie przed rozmową rekrutacyjną:</p>
          <ul className="list-disc text-xs list-inside space-y-1">
            <li>Historia i profil działalności firmy - dowiedz się, kiedy powstała firma, jak się rozwijała i czym dokładnie się zajmuje</li>
            <li>Opinie pracowników i kultura organizacyjna - poznaj wartości firmy i to, co cenią sobie jej pracownicy</li>
            <li>Poziom wynagrodzeń na podobnych stanowiskach - sprawdź, jakie są średnie zarobki na stanowisku, o które się ubiegasz</li>
            <li>Wymagania i oczekiwania rekruterów - zrozum, czego dokładnie szuka firma w idealnym kandydacie</li>
            <li>Najnowsze informacje i osiągnięcia firmy - bądź na bieżąco z aktualnymi wydarzeniami w firmie</li>
          </ul>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-sidebar border border-blue-100 rounded">
            <p className="italic text-xs text-blue-700 dark:text-blue-400">
              Wybierz ofertę pracy poniżej i kliknij "Wyszukaj informacje o firmie", aby poznać szczegóły. Te informacje pomogą Ci lepiej przygotować się do rozmowy i zrobić dobre pierwsze wrażenie.
            </p>
          </div>
        </div>
      );
    } else if (selectedTrainingType === 'questions') {
      return (
        <div className="text-gray-600 dark:text-gray-400">
          <h3 className="text-lg -mt-2 text-gray-800 dark:text-gray-200 font-medium mb-2">Typowe pytania rekrutacyjne</h3>
          <p className="mb-3 text-sm">Przygotuj się na najczęściej zadawane pytania dopasowane do Twojego CV i wybranej oferty pracy:</p>
          <ul className="list-disc text-xs list-inside space-y-1">
            <li>O Twoim doświadczeniu - pytania dotyczące konkretnych projektów i osiągnięć z Twojego CV</li>
            <li>O mocnych i słabych stronach - jak zaprezentować swoje atuty i jak mówić o obszarach do rozwoju</li>
            <li>O osiągnięciach zawodowych - jak skutecznie opowiadać o swoich sukcesach bez przesadnej skromności</li>
            <li>O oczekiwaniach finansowych - jak negocjować wynagrodzenie i jakich argumentów używać</li>
            <li>Pytania behawioralne - jak odpowiadać na pytania o konkretne sytuacje z przeszłości</li>
            <li>Pytania techniczne - jak przygotować się do sprawdzenia umiejętności związanych ze stanowiskiem</li>
          </ul>
          <div className="mt-4 p-2 bg-yellow-50 dark:bg-sidebar border border-yellow-100 rounded">
            <div className="text-xs text-yellow-800 dark:text-yellow-400">
              <span className="font-medium">Wskazówka: </span>
              Po wybraniu CV i oferty pracy, system wygeneruje zestaw spersonalizowanych pytań, które możesz przećwiczyć przed rozmową.
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="dark:text-gray-400 text-gray-600">
          <h3 className="text-lg text-gray-800 dark:text-gray-200 font-medium mb-2">Praktyka i symulacja rozmowy</h3>
          <p className="mb-4 text-sm">Przećwicz rozmowę w bezpiecznym środowisku z naszym AI:</p>
          <ul className="list-disc text-xs list-inside space-y-2">
            <li>Symulacja rozmowy z AI - pełne doświadczenie rozmowy rekrutacyjnej bez stresu związanego z prawdziwym spotkaniem</li>
            <li>Natychmiastowy feedback - otrzymaj szczegółową ocenę swoich odpowiedzi po każdym pytaniu</li>
            <li>Wskazówki do poprawy - konkretne sugestie, jak ulepszyć swoje odpowiedzi</li>
            <li>Nagrywanie odpowiedzi - możliwość nagrania i przesłuchania swoich odpowiedzi, aby zidentyfikować obszary do poprawy</li>
            <li>Śledzenie postępów - monitor swojego rozwoju i zwiększanie pewności siebie z każdą sesją treningową</li>
            <li>Różne scenariusze rozmów - przygotuj się na różne style prowadzenia rozmów rekrutacyjnych</li>
          </ul>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-sidebar border border-blue-100 rounded">
            <div className="text-xs text-blue-700">
              <span className="font-medium">Informacja: </span>
              Ten trening jest najbardziej zbliżony do rzeczywistej rozmowy kwalifikacyjnej. Zalecamy przejście przez "Przygotowanie" i "Pytania" przed rozpoczęciem pełnej symulacji.
            </div>
          </div>
        </div>
      );
    }
  };

  // Renderowanie wyboru CV i oferty - tylko zawartość bez przycisków
  const renderCVAndOfferSelection = () => {
    if (selectedTrainingType === 'preparation') {
      return (
        <div className="flex flex-col flex-grow min-h-0">
          {isLoading ? (
            <div className="p-4 text-gray-500 dark:text-gray-400 text-center">Ładowanie ofert pracy...</div>
          ) : jobOffers.length === 0 ? (
            <div className="p-4 text-gray-500 dark:text-gray-400 text-center">Nie masz żadnych zapisanych ofert pracy.</div>
          ) : (
            <div 
              className="overflow-y-auto flex-grow min-h-0"
              style={scrollbarStyles}
            >
              {jobOffers.map(offer => (
                <div 
                  key={offer.id} 
                  className={`border ${selectedOffer === offer.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600'} 
                    rounded-md p-2 mb-2 cursor-pointer transition-all`}
                  onClick={() => setSelectedOffer(offer.id)}
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start ml-2 mr-2 mb-2">
                      <div>
                        <h3 className="font-medium text-sm">{offer.title}</h3>
                        <p className="text-xs dark:text-gray-400 text-gray-600">{offer.company}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-0.5 rounded text-white ${getStatusStyles(offer.status)}`}>
                          {statusMap[offer.status] || offer.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (selectedTrainingType === 'questions') {
      return (
        <div className="flex gap-10 flex-grow min-h-0">
          {/* Wybór CV - lewa kolumna - 1/3 szerokości */}
          <div className="flex flex-col flex-1 min-h-0">
            <h3 className="text-2xs font-medium mb-2 ml-2">Twoje CV</h3>
            <div 
              className="overflow-y-auto flex-grow min-h-0"
              style={scrollbarStyles}
            >
              {savedCVs.length === 0 ? (
                <div className="p-4 text-gray-500 dark:text-gray-400 text-center text-xs border border-gray-200 dark:border-gray-600 rounded-md">
                  Nie masz żadnych zapisanych CV.
                </div>
              ) : (
                savedCVs.map((cv) => (
                  <div 
                    key={cv.id} 
                    className={`border ${selectedCV === cv.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600'} 
                      rounded-md p-2 mb-2 cursor-pointer transition-all`}
                    onClick={() => setSelectedCV(cv.id)}
                  >
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-xs">{cv.name}</h3>
                          {cv.job_offer_id && (
                            <span className="text-[10px] dark:text-gray-400 text-gray-500">
                              Dopasowane do oferty
                            </span>
                          )}
                        </div>
                        {selectedCV === cv.id && (
                          <span className="text-purple-500 text-xs">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Wybór oferty - prawa kolumna - 2/3 szerokości */}
          <div className="flex flex-col flex-[2] min-h-0">
            <h3 className="text-2xs font-semibold mb-2 ml-2">Oferty pracy</h3>
            <div 
              className="overflow-y-auto flex-grow min-h-0"
              style={scrollbarStyles}
            >
              {jobOffers.length === 0 ? (
                <div className="p-4 text-gray-500 dark:text-gray-400 text-center text-xs border border-gray-200 dark:border-gray-600 rounded-md">
                  Nie masz żadnych zapisanych ofert.
                </div>
              ) : (
                jobOffers.map(offer => (
                  <div 
                    key={offer.id} 
                    className={`border ${selectedOffer === offer.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600'} 
                      rounded-md p-1 mb-2 cursor-pointer transition-all`}
                    onClick={() => setSelectedOffer(offer.id)}
                  >
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start ml-2 mr-2">
                        <div>
                          <h3 className="font-medium text-xs">{offer.title}</h3>
                          <p className="text-[10px] dark:text-gray-400 text-gray-600">{offer.company}</p>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-[10px] mt-1 px-1.5 py-0.5 rounded text-white ${getStatusStyles(offer.status)}`}>
                            {statusMap[offer.status] || offer.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Renderowanie przycisków akcji
  const renderActionButton = () => {
    if (selectedTrainingType === 'preparation') {
      return (
        <button 
          className={`px-4 py-2 rounded-md transition w-full ${
            selectedOffer && !isGeneratingQuestions
              ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!selectedOffer || isGeneratingQuestions}
          onClick={() => {
            if (selectedOffer) {
              const selectedOfferObject = jobOffers.find(o => o.id === selectedOffer);
              
              if (selectedOfferObject) {
                // W przypadku przygotowania nie potrzebujemy CV
                onStartTraining({
                  id: 'preparation',
                  name: 'Przygotowanie',
                  selected_template: '',
                  job_offer_id: selectedOfferObject.id,
                  is_draft: false,
                  created_at: '',
                  updated_at: ''
                }, selectedOfferObject);
              }
            }
          }}
        >
          Wyszukaj informacje o firmie
        </button>
      );
    } else if (selectedTrainingType === 'questions') {
      return (
        <button 
          className={`px-4 py-2 rounded-md transition w-full ${
            selectedCV && selectedOffer && !isGeneratingQuestions
              ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!selectedCV || !selectedOffer || isGeneratingQuestions}
          onClick={() => {
            if (selectedCV && selectedOffer) {
              const selectedCVObject = savedCVs.find(cv => cv.id === selectedCV);
              const selectedOfferObject = jobOffers.find(offer => offer.id === selectedOffer);
              
              if (selectedCVObject && selectedOfferObject) {
                onStartTraining(selectedCVObject, selectedOfferObject);
              }
            }
          }}
        >
          {isGeneratingQuestions ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white dark:border-gray-400 mr-2"></div>
              <span>Generowanie pytań...</span>
            </div>
          ) : (
            'Wygeneruj pytania'
          )}
        </button>
      );
    } else if (selectedTrainingType === 'practice') {
      return (
        <div className="text-center">
          <div className="flex flex-col items-center p-6 border border-green-100 dark:border-green-600 bg-green-50 dark:bg-sidebar rounded-lg">
            <Target className="h-12 w-12 text-green-500 mb-2" />
            <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-3">Praktyka i symulacja rozmowy</h3>
            <p className="text-sm text-green-700 dark:text-green-400 mb-4">
              Weź udział w pełnej symulacji rozmowy kwalifikacyjnej z naszym wirtualnym rekruterem.
            </p>
            <button
              onClick={() => {
                // Rozpoczynamy trening praktyczny z pustymi danymi
                onStartTraining({
                  id: 'practice',
                  name: 'Praktyka',
                  selected_template: '',
                  job_offer_id: null,
                  is_draft: false,
                  created_at: '',
                  updated_at: ''
                }, {
                  id: 'practice',
                  user_id: '',
                  title: 'Praktyka symulacji',
                  company: 'Symulacja rozmowy',
                  site: null,
                  url: null,
                  status: '',
                  full_description: null,
                  note: null,
                  salary: null,
                  created_at: '',
                  status_changes: [],
                  expire: null,
                  priority: 0
                });
              }}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-md hover:from-green-600 hover:to-green-800 transition-all shadow-sm"
            >
              Rozpocznij symulację rozmowy
            </button>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(85vh)]">
      {/* Kontener dla kart z ustaloną wysokością */}
      <div className="h-[90px] min-h-[90px]">
        {/* Karty typów treningu w poziomie */}
        <div className="grid grid-cols-3 gap-1.5">
          {/* Karta 1 - Przygotowanie */}
          <div
            onClick={() => onTrainingSelect('preparation')}
            className={`
              p-4 rounded-t-sm 
              bg-white dark:bg-sidebar
              shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
              cursor-pointer transition-all text-center
              border-t-[6px]
              ${
                selectedTrainingType === 'preparation' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-t-blue-600/20 hover:border-blue-300'
              }
            `}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Przygotowanie</h3>
              <ClipboardList className="h-6 w-6 text-blue-500" />
            </div>
            <p className="dark:text-gray-400 text-xs text-gray-500">Poznaj informacje o firmie</p>
          </div>

          {/* Karta 2 - Typowe pytania */}
          <div
            onClick={() => onTrainingSelect('questions')}
            className={`
              p-4 rounded-t-sm  
              bg-white dark:bg-sidebar
              shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
              cursor-pointer transition-all text-center
              border-t-[6px]
              ${
                selectedTrainingType === 'questions' 
                  ? 'border-purple-600 bg-purple-50' 
                  : 'border-t-purple-600/20 hover:border-purple-300'
              }
            `}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Trening</h3>
              <HelpCircle className="h-6 w-6 text-purple-500" />
            </div>
            <p className="dark:text-gray-400 text-xs text-gray-500">Pytania rekrutacyjne</p>
          </div>

          {/* Karta 3 - Praktyka */}
          <div
            onClick={() => onTrainingSelect('practice')}
            className={`
              p-4 rounded-t-sm 
              bg-white dark:bg-sidebar
              shadow-[2px_4px_10px_rgba(0,0,0,0.3)]
              cursor-pointer transition-all text-center
              border-t-[6px]
              ${
                selectedTrainingType === 'practice' 
                  ? 'border-green-600 bg-green-50' 
                  : 'border-t-green-600/20 hover:border-green-300'
              }
            `}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Praktyka</h3>
              <Target className="h-6 w-6 text-green-500" />
            </div>
            <p className="dark:text-gray-400 text-xs text-gray-500">Symulacja rozmowy</p>
          </div>
        </div>
      </div>

      {/* Główny kontener z białym tłem - używamy flex column */}
      <div className="bg-white dark:bg-sidebar rounded-b-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] p-6 flex-grow flex flex-col mt-1 h-[calc(75vh)]">
        {/* Obszar przewijalny z zawartością - flex-grow aby wypełnił dostępną przestrzeń */}
        <div className="flex-grow overflow-hidden flex flex-col min-h-0">
          {/* Informacje o treningu */}
          <div className="bg-gray-50 dark:bg-sidebar border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4 flex-shrink-0">
            {renderTrainingInfo()}
          </div>

          {/* Wybór CV i oferty - wyświetlany tylko gdy typ treningu jest wybrany i nie jest praktyką */}
          {selectedTrainingType && selectedTrainingType !== 'practice' && (
            <div className="flex-grow flex flex-col min-h-0">
              {isLoading ? (
                <div className="dark:text-gray-400 text-center py-4 text-gray-500">
                  Ładowanie danych...
                </div>
              ) : (
                renderCVAndOfferSelection()
              )}
            </div>
          )}
        </div>

        {/* Przyciski akcji - zawsze na dole karty */}
        {selectedTrainingType && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600 mt-4 flex-shrink-0">
            {renderActionButton()}
          </div>
        )}
      </div>
    </div>
  );
} 