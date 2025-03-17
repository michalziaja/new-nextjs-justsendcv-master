// // // store/userStore.ts
// // import { create } from 'zustand';
// // import { persist } from 'zustand/middleware';

// // // Typ użytkownika na podstawie danych z Supabase (auth.users i raw_user_meta_data)
// // type User = {
// //   id: string;
// //   email: string;
// //   name?: string; // Z raw_user_meta_data
// //   avatar?: string; // Z raw_user_meta_data, jeśli istnieje
// // } | null;

// // type UserStore = {
// //   user: User;
// //   isLoading: boolean; // Dodajemy stan ładowania
// //   setUser: (user: User) => void;
// //   clearUser: () => void;
// //   setLoading: (loading: boolean) => void;
// //   logout: () => void;
// // };

// // export const useUserStore = create<UserStore>()(
// //   persist(
// //     (set) => ({
// //       user: null,
// //       isLoading: true, // Domyślnie ustawiamy true - dane są w trakcie ładowania
// //       setUser: (user) => set({ user, isLoading: false }),
// //       clearUser: () => set({ user: null, isLoading: false }),
// //       setLoading: (loading) => set({ isLoading: loading }),
// //       logout: () => set({ user: null }),
// //     }),
// //     {
// //       name: 'user-storage', // Nazwa w localStorage
// //       partialize: (state) => ({ user: state.user }), // Zapisujemy tylko dane użytkownika
// //     }
// //   )
// // );

// import { create } from "zustand";

// type User = {
//   id: string;
//   name: string;
//   email: string;
//   avatar: string;
// };

// type UserStore = {
//   user: User | null;
//   setUser: (user: User) => void;
// };

// export const useUserStore = create<UserStore>((set) => ({
//   user: null,
//   setUser: (user) => set({ user }),
// }));