// Interfejs dla oferty pracy z bazy Supabase
export interface JobOffer {
  id: string;
  user_id: string;
  title: string;
  company: string;
  site: string | null;
  url: string | null;
  status: string;
  full_description: string | null;
  note: string | null;
  salary: string | null;
  created_at: string;
  status_changes: string[];
  expire: string | null;
  priority: number;
}

// Interfejs dla zapisanego CV
export interface SavedCV {
  id: string;
  name: string;
  selected_template: string;
  job_offer_id: string | null;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

// Interfejs dla wyników wyszukiwania
export interface SearchResults {
  companyInfo: string;
  employeeReviews: string;
  salaryInfo: string;
  competitorsSimilarities?: string;
  isLoading: boolean;
  groundingLinks?: { url: string, text: string }[];
  saved?: boolean;
}

// Interfejs dla pytania rekrutacyjnego
export interface Question {
  id: number;
  question: string;
  tips: string[];
} 