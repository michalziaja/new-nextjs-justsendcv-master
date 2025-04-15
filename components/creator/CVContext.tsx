"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { JobOffer, mockUserProfile } from './mockData';

// Definicja interfejsu danych CV
export interface CVData {
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  description: string;
  experience: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    type?: 'job' | 'project';
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
  rodoClause?: string;
}

// Interfejs kontekstu CV
interface CVContextProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
  selectedJob: JobOffer | null;
  setSelectedJob: React.Dispatch<React.SetStateAction<JobOffer | null>>;
  selectedTemplate: string;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<string>>;
  activeSection: string;
  setActiveSection: React.Dispatch<React.SetStateAction<string>>;
}

// Początkowy stan danych CV
const initialCVData: CVData = {
  personalData: {
    firstName: mockUserProfile.firstName,
    lastName: mockUserProfile.lastName,
    email: mockUserProfile.email,
    phone: mockUserProfile.phone,
    address: mockUserProfile.address,
  },
  description: '',
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
  rodoClause: 'Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z Ustawą z dnia 10 maja 2018 r. o ochronie danych osobowych oraz Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r.).',
};

// Utworzenie kontekstu
const CVContext = createContext<CVContextProps | undefined>(undefined);

// Provider kontekstu
export function CVProvider({ children }: { children: ReactNode }) {
  const [cvData, setCvData] = useState<CVData>(initialCVData);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('nowoczesny');
  const [activeSection, setActiveSection] = useState<string>('start');

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