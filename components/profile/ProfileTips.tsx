import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Lightbulb, Check } from 'lucide-react';

export default function ProfileTips() {
  return (
    <Card className="shadow-[2px_4px_10px_rgba(0,0,0,0.3)] bg-gray-50 border-primary/20 rounded-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
          Wskazówki dla profilu
        </CardTitle>
        <CardDescription>
          Jak stworzyć atrakcyjny profil zawodowy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <h3 className="font-medium text-sm flex items-center">
            <Check className="h-4 w-4 mr-1 text-green-500" />
            Kompletność danych
          </h3>
          <p className="text-sm text-muted-foreground">
            Uzupełnij wszystkie podstawowe dane. Kompletny profil wzbudza większe zaufanie 
            i pozwala na lepsze wykorzystanie funkcji aplikacji.
          </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-sm flex items-center">
            <Check className="h-4 w-4 mr-1 text-green-500" />
            Sekcja "O mnie"
          </h3>
          <p className="text-sm text-muted-foreground">
            Krótko i treściwie opisz swoje doświadczenie i cele zawodowe. Unikaj zbyt ogólnych 
            określeń na rzecz konkretów.
          </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-sm flex items-center">
            <Check className="h-4 w-4 mr-1 text-green-500" />
            Linki społecznościowe
          </h3>
          <p className="text-sm text-muted-foreground">
            Dodaj linki do swojego portfolio, GitHuba czy LinkedIn. Pokazują one Twoją 
            aktywność zawodową oraz umiejętności.
          </p>
        </div>
        
        <div className="mt-4 text-sm flex items-start p-2 bg-amber-50 border border-amber-200 rounded-md">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-amber-800">
            Pamiętaj, że dane wprowadzone w profilu będą używane do automatycznego 
            uzupełniania CV i dokumentów aplikacyjnych.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 