"use client";

import React from 'react';
import TemplateSelector from '@/components/assistant/templateSelector';
import InputForm from '@/components/assistant/inputForm';
import DokumentEditor from '@/components/assistant/dokumentEditor';
import { AssistantProvider } from '@/components/assistant/assistantContext';

export default function AsystentAI() {
  return (
    <AssistantProvider>
      <div className="flex flex-1 flex-col gap-2 p-2">
        <div className="mb-14 ml-2 mr-2 mt-6 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6 md:mt-7 
        lg:ml-8 lg:mr-6 lg:mt-12 xl:ml-15 xl:mr-15 xl:mt-12">
          <TemplateSelector />
        </div>

        <div className="grid gap-2 grid-cols-1 md:grid-cols-2
        ml-2 mr-2 sm:ml-1 sm:mr-1 md:ml-6 md:mr-6  
        lg:ml-8 lg:mr-6 xl:ml-15 xl:mr-15">
          <div className="h-full">
            <InputForm />
          </div>

          <div className="h-full">
            <DokumentEditor />
          </div>
        </div>
      </div>
    </AssistantProvider>
  );
} 