// Typy używane w całej aplikacji

export interface UserData {
  id: string;
  name: string;
  email: string;
  first_name?: string;
  last_name?: string;
  social_links?: string;
  about_me?: string;
  avatar?: string;
  createdAt: string;
  isSubscribed?: boolean;
}

// Dodaj inne typy używane w aplikacji 