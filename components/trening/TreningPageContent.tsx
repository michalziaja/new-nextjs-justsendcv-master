"use client";

import React, { useState } from 'react';
import TrainingSelection from '@/components/trening/TrainingSelection';
import TrainingQuestions from '@/components/trening/TrainingQuestions';
import TrainingPreparation from '@/components/trening/TrainingPreparation';
import TrainingPractice from '@/components/trening/TrainingPractice';
import { useTrainingData } from './TrainingDataProvider';
import { JobOffer, SavedCV } from '@/types/database.types';

export default function TreningPageContent() {
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null);
  const [selectedCV, setSelectedCV] = useState<SavedCV | null>(null);
  const [selectedJobOffer, setSelectedJobOffer] = useState<JobOffer | null>(null);
  const [trainingStarted, setTrainingStarted] = useState<boolean>(false);
  const [sharedTrainingState, setSharedTrainingState] = useState<{
    preparation: boolean;
    questions: boolean;
    practice: boolean;
  }>({
    preparation: false,
    questions: false,
    practice: false
  });

  const { 
    isGeneratingQuestions,
    checkExistingCompanyData,
    checkExistingQuestions
  } = useTrainingData();

  // Funkcja do rozpoczęcia treningu
  const handleStartTraining = (cv: SavedCV, jobOffer: JobOffer) => {
    setSelectedCV(cv);
    setSelectedJobOffer(jobOffer);
    
    // Oznaczamy stan treningu dla aktualnego typu
    if (selectedTraining) {
      setSharedTrainingState(prev => ({
        ...prev,
        [selectedTraining]: true
      }));
    }
    
    setTrainingStarted(true);
    
    // W zależności od typu treningu, wywołujemy odpowiednią funkcję
    if (selectedTraining === 'questions') {
      checkExistingQuestions(jobOffer);
    } else if (selectedTraining === 'preparation') {
      checkExistingCompanyData(jobOffer);
    }
  };
  
  // Funkcja obsługująca przełączanie między typami treningu
  const handleTrainingTypeChange = (type: string | null) => {
    setSelectedTraining(type);
    
    // Jeśli zmieniamy typ treningu, ale już wcześniej rozpoczęliśmy trening dla tego typu,
    // nie resetujemy stanu treningu
    if (type) {
      setTrainingStarted(sharedTrainingState[type as keyof typeof sharedTrainingState]);
    } else {
      setTrainingStarted(false);
    }
  };

  // Funkcja pomocnicza do renderowania odpowiedniego komponentu w zależności od wybranego typu treningu
  const renderTrainingComponent = () => {
    if (selectedTraining === 'preparation') {
      return (
        <TrainingPreparation
          trainingStarted={trainingStarted}
          selectedCV={selectedCV}
          selectedJobOffer={selectedJobOffer}
        />
      );
    } else if (selectedTraining === 'practice') {
      return (
        <TrainingPractice
          trainingStarted={trainingStarted}
          selectedCV={selectedCV}
          selectedJobOffer={selectedJobOffer}
        />
      );
    } else {
      return (
        <TrainingQuestions
          trainingStarted={trainingStarted}
          selectedCV={selectedCV}
          selectedJobOffer={selectedJobOffer}
          trainingType={selectedTraining}
          isGeneratingQuestions={isGeneratingQuestions}
        />
      );
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-2 p-2 transition-all duration-200">
      {/* Główna zawartość - dwie kolumny */}
      <div className="grid h-[calc(84vh)] grid-cols-1 mt-12 md:grid-cols-2 gap-6
      ml-2 mr-2 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6  
      lg:ml-8 lg:mr-6 xl:ml-15 xl:mr-15">
        {/* Lewa kolumna - wybór zagadnień */}
        <TrainingSelection 
          onTrainingSelect={handleTrainingTypeChange} 
          onStartTraining={handleStartTraining}
          isGeneratingQuestions={isGeneratingQuestions}
          selectedTrainingType={selectedTraining}
        />

        {/* Prawa kolumna - wyświetlanie odpowiedniego komponentu (przygotowanie lub pytania) */}
        {renderTrainingComponent()}
      </div>
    </div>
  );
} 