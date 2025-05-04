import { ReactNode } from "react";

// Typy dla dokumentów
export type DocumentType = 
  | "hr_message"
  | "welcome_message"
  | "status_inquiry"
  | "thank_you"
  | "feedback_request"
  | "clarification_request"
  | "team_welcome";

// Konfiguracja dokumentu
export interface DocumentConfig {
  id: DocumentType;
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
}

// Oferta pracy
export interface JobOffer {
  id: string;
  title: string;
  company: string;
  site?: string | null;
  full_description?: string | null;
  created_at: string;
}

// CV użytkownika
export interface CV {
  id: string;
  name: string;
  created_at: string;
  job_offer_id?: string | null;
  selected_template?: string;
} 