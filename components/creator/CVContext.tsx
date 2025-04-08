"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Application } from '@/components/saved/mockData';

// Definicja interfejsu danych CV
export interface CVData {
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  experience: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: Array<{
      language: string;
      level: string;
    }>;
  };
}

// Interfejs kontekstu CV
interface CVContextProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
  selectedJob: Application | null;
  setSelectedJob: React.Dispatch<React.SetStateAction<Application | null>>;
  selectedTemplate: string;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<string>>;
  activeSection: string;
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
}

// Początkowy stan danych CV
const initialCVData: CVData = {
  personalData: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  },
  experience: [
    {
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ],
  education: [
    {
      school: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ],
  skills: {
    technical: [],
    soft: [],
    languages: [
      { language: '', level: '' },
    ],
  },
};

// Utworzenie kontekstu
const CVContext = createContext<CVContextProps | undefined>(undefined);

// Provider kontekstu
export function CVProvider({ children }: { children: ReactNode }) {
  const [cvData, setCvData] = useState<CVData>(initialCVData);
  const [selectedJob, setSelectedJob] = useState<Application | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('nowoczesny');
  const [activeSection, setActiveSection] = useState<string>('jobSelection');

  return (
    <CVContext.Provider
      value={{
        cvData,
        setCvData,
        selectedJob,
        setSelectedJob,
        selectedTemplate,
        setSelectedTemplate,
        activeSection,
        setActiveSection,
      }}
    >
      {children}
    </CVContext.Provider>
  );
}

// Hook do używania kontekstu CV
export function useCV() {
  const context = useContext(CVContext);
  if (context === undefined) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
} 