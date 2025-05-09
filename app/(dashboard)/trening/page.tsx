"use client";

import React from 'react';
import { TrainingDataProvider } from '@/components/trening/TrainingDataProvider';
import TreningPageContent from '@/components/trening/TreningPageContent';

// Komponent głównej strony treningu
export default function TreningPage() {
  return (
    <TrainingDataProvider>
      <TreningPageContent />
    </TrainingDataProvider>
  );
}
