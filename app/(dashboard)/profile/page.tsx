"use client";

import React from 'react';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import ProfileTips from '@/components/profile/ProfileTips';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

// Komponent wskazówki
const Tip = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gray-50 dark:bg-sidebar rounded-md p-3 border border-primary/10 dark:border-primary/10">
    <div className="flex items-center gap-2 mb-1.5">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-amber-500/20"></div>
        <Lightbulb className="h-4 w-4 text-amber-500 relative z-10" />
      </div>
      <p className="text-sm font-medium">Wskazówka</p>
    </div>
    <p className="text-xs text-muted-foreground">{children}</p>
  </div>
);

export default function Page() {
  return (
    <div className="flex flex-1 flex-col p-2 ">
      <div className="mx-2 sm:mx-1 md:mx-6 lg:mx-8 xl:mx-15 mt-12">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Lewa kolumna - Avatar i wskazówki w jednej karcie */}
          <div className="w-full lg:w-[38%] ">
            <Card className="shadow-[2px_4px_10px_rgba(0,0,0,0.3)]  min-h-[75vh] rounded-sm dark:bg-sidebar">
              <CardContent className="p-2 -mt-2 space-y-6">
                {/* Sekcja ze zdjęciem */}
                <ProfileAvatar />
                
                {/* Wskazówki bezpośrednio pod zdjęciem */}
                <div className="pt-4 p-4">
                  <ProfileTips />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prawa kolumna - Wszystkie dane w jednej karcie */}
          <div className="w-full lg:w-[62%]">
            <Card className="shadow-[2px_4px_10px_rgba(0,0,0,0.3)]  min-h-[75vh] rounded-sm p-6 dark:bg-sidebar">
              <ProfileForm />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
