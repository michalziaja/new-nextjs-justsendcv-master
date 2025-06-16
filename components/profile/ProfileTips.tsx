import React from 'react';
import { CardDescription } from '@/components/ui/card';
import { AlertCircle, Lightbulb, Check } from 'lucide-react';

export default function ProfileTips() {
  return (
    <div className="space-y-3 bg-gray-50 dark:bg-slate-800 rounded-md p-3 border border-gray-200 dark:border-gray-600">
      <div className="flex items-center mb-2">
        <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
        <h3 className="text-lg font-semibold">Wskazówki</h3>
      </div>
      <CardDescription className="mb-3">
        Jak stworzyć atrakcyjny profil
      </CardDescription>
      
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-medium text-sm flex items-center">
            <Check className="h-4 w-4 mr-1 text-green-500" />
            Zdjęcie profilowe
          </h3>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Wybierz profesjonalne zdjęcie z wyraźnie widoczną twarzą na neutralnym tle.
          </p>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-medium text-sm flex items-center">
            <Check className="h-4 w-4 mr-1 text-green-500" />
            Dane kontaktowe
          </h3>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Uzupełnij wszystkie podstawowe dane kontaktowe dla lepszej komunikacji.
          </p>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-medium text-sm flex items-center">
            <Check className="h-4 w-4 mr-1 text-green-500" />
            O mnie
          </h3>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Krótko i treściwie opisz swoje doświadczenie i cele zawodowe.
          </p>
        </div>
        
        <div className="mt-3 text-xs flex items-start p-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-md">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-gray-700 dark:text-gray-400">
            Dane z profilu będą używane do automatycznego uzupełniania CV.
          </p>
        </div>
      </div>
    </div>
  );
} 