import { create } from 'zustand';

// Typ dla danych użytkownika (dostosuj do swoich potrzeb)
type User = {
  id: string;
  email: string;
  name?: string;
  // inne pola, które przechowujesz w Supabase
} | null;

type UserStore = {
  user: User;
  setUser: (user: User) => void;
  clearUser: () => void;
};

// Tworzenie store
export const useUserStore = create<UserStore>((set) => ({
  user: null, // Początkowy stan - brak użytkownika
  setUser: (user) => set({ user }), // Ustawianie danych użytkownika
  clearUser: () => set({ user: null }), // Wylogowanie/czyszczenie danych
}));