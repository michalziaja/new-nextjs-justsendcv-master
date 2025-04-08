"use client";

import React from 'react';
import Creator from "@/components/creator/Creator";
import Preview from '@/components/creator/Preview';
import { CVProvider } from '@/components/creator/CVContext';




// Główny komponent strony
export default function CreatorPage() {
  return (
    <CVProvider>
      <div className="h-full p-8">
        <div className="grid grid-cols-2 gap-8 max-w-[1800px] mx-auto">
          <Creator />
          <Preview />
        </div>
      </div>
    </CVProvider>
  );
} 