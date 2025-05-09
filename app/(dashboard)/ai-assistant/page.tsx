"use client";

import React from 'react';
import TemplateSelector from '@/components/assistant/templateSelector';
import InputForm from '@/components/assistant/inputForm';
import DokumentEditor from '@/components/assistant/dokumentEditor';
import { AssistantProvider } from '@/components/assistant/assistantContext';

export default function AsystentAI() {
  return (
    <AssistantProvider>
      <div className="container mx-auto py-6 space-y-6">
        {/* Górny kontener na całą długość */}
        <TemplateSelector />

        {/* Dwa kontenery w dwóch kolumnach */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Lewa kolumna - wybór oferty, CV i dodatkowe informacje */}
          <InputForm />

          {/* Prawa kolumna - wyświetlanie tekstu w edytorze */}
          <DokumentEditor />
        </div>
      </div>
    </AssistantProvider>
  );
} 