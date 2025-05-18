"use client";

import React, { useState } from 'react';
import { JobOffer, SavedCV } from '@/types/database.types';
import { useTrainingData } from './TrainingDataProvider';

interface TrainingQuestionsProps {
  trainingStarted: boolean;
  selectedCV: SavedCV | null;
  selectedJobOffer: JobOffer | null;
  trainingType: string | null;
  isGeneratingQuestions?: boolean;
}

export default function TrainingQuestions({ 
  trainingStarted, 
  selectedCV, 
  selectedJobOffer, 
  trainingType,
  isGeneratingQuestions = false,
}: TrainingQuestionsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const { questions } = useTrainingData();

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Jeśli trening nie został rozpoczęty
  if (!trainingStarted) {
    return (
      <div
        className="bg-white rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] p-6 h-full overflow-hidden"
      >
        <div className="bg-white rounded-lg p-6 h-full flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-6">🎓</div>
          <h2 className="text-xl font-semibold mb-4">Przygotuj się do rozmowy rekrutacyjnej</h2>
          <p className="text-gray-600 mb-6">
            Wybierz CV i ofertę pracy, aby rozpocząć przygotowania do rozmowy.
          </p>
          <div className="text-sm text-gray-500">
            <p>Dzięki naszemu treningowi:</p>
            <ul className="list-disc list-inside text-left mt-2 space-y-1">
              <li>Poznasz informacje o firmie przed rozmową</li>
              <li>Przygotujesz odpowiedzi na pytania rekruterów</li>
              <li>Przeanalizujesz informacje o wynagrodzeniach i opiniach pracowników</li>
              <li>Zwiększysz swoje szanse na sukces podczas rozmowy</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Zmieniona logika dla ekranu "brak pytań" - teraz wyświetlamy ekran ładowania jeśli się generują
  if (isGeneratingQuestions) {
    // Sprawdź, czy mamy już częściowe wyniki (czy generowanie jest w trakcie)
    const questionsInProgress = questions.length > 0;
    const maxQuestions = selectedCV ? 20 : 15; // 4 grupy po 5 pytań, jeśli mamy CV, w przeciwnym razie 3 grupy
    const progressText = questionsInProgress 
      ? `Wygenerowano ${questions.length} z ${maxQuestions} pytań...` 
      : "Generowanie pytań rekrutacyjnych...";
    
    const progressPercentage = questions.length / maxQuestions * 100;

    return (
      <div
        className="bg-white rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] p-6 h-full overflow-hidden flex flex-col"
      >
        <div className="rounded-lg p-6 flex-grow flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-gray-600 mb-2">{progressText}</p>
          {questionsInProgress && (
            <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          )}
          <p className="text-sm text-gray-500">Etap {Math.ceil(questions.length / 5)} z {selectedCV ? 4 : 3}</p>
        </div>
      </div>
    );
  }

  // Sprawdzamy, czy pytania są dostępne
  if (!trainingType || !questions.length) {
    return (
      <div
        className="bg-white rounded-lg shadow-[2px_4px_10px_rgba(0,0,0,0.3)] p-6 h-full overflow-hidden"
      >
        <div className="bg-white rounded-lg p-6 h-full flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-6">🎯</div>
          <h2 className="text-xl font-semibold mb-4">Wybierz ofertę pracy</h2>
          <p className="text-gray-600 mb-6">
            Wybierz ofertę pracy, aby rozpocząć przygotowania do rozmowy.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div
      className="bg-white rounded-sm shadow-[2px_4px_10px_rgba(0,0,0,0.3)] p-5 h-full overflow-hidden flex flex-col"
    >
      {/* <h2 className="text-xl font-semibold mb-4">Pytania i wskazówki</h2> */}
      
      {selectedJobOffer && selectedCV && (
        <div className="bg-blue-50 text-blue-800 rounded-lg p-3 mb-4 text-sm">
          <div className="flex justify-between items-center">
            <div>
              <p><strong>CV:</strong> {selectedCV.name}</p>
              <p><strong>Oferta:</strong> {selectedJobOffer.title} - {selectedJobOffer.company}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 mt-4 flex-grow flex flex-col overflow-hidden">
        {/* Nagłówek pytania */}
        <div className="mb-5">
          <h3 className="text-md font-medium text-gray-600 mb-2">Pytanie {currentQuestionIndex + 1} z {questions.length}</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-gray-800 text-lg font-medium">{currentQuestion?.question}</p>
          </div>
        </div>

        {/* Wskazówki */}
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mt-4 mb-6">
          <h4 className="font-medium text-purple-800 mb-2 text-sm">Wskazówki do odpowiedzi:</h4>
          <ul className="list-disc list-inside text-purple-700 text-sm space-y-2 ml-1">
            {currentQuestion?.tips.map((tip: string, index: number) => (
              <li key={index} className="leading-tight">{tip}</li>
            ))}
          </ul>
        </div>
        
        {/* Dodatkowa informacja - pusta przestrzeń */}
        <div className="rounded-md mb-auto"></div>

        {/* Przyciski nawigacji */}
        <div className="flex justify-between mt-6">
          <button 
            className={`px-5 py-2 rounded-md transition shadow-sm ${
              currentQuestionIndex > 0 
                ? 'bg-gradient-to-r from-gray-500 to-gray-700 text-white hover:from-gray-600 hover:to-gray-800' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Poprzednie
          </button>
          <button 
            className={`px-5 py-2 rounded-md transition shadow-sm ${
              currentQuestionIndex < questions.length - 1 
                ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Następne
          </button>
        </div>
      </div>
    </div>
  );
} 