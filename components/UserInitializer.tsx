// // components/UserInitializer.tsx
// "use client";

// import { useEffect } from "react";
// import { useUserStore } from "@/store/userStore";
// import { createClient } from "@/utils/supabase/client";

// const supabase = createClient();

// export default function UserInitializer() {
//   const { setUser, clearUser, setLoading } = useUserStore();

//   useEffect(() => {
//     // Ustawiamy stan ładowania na początku
//     setLoading(true);

//     const fetchUser = async () => {
//       try {
//         const { data: { user }, error } = await supabase.auth.getUser();
//         if (error) {
//           console.error("Error fetching user:", error);
//           clearUser();
//           return;
//         }
//         if (user) {
//           setUser({
//             id: user.id,
//             email: user.email!,
//             name: user.user_metadata?.name || "User", // Z raw_user_meta_data
//             avatar: user.user_metadata?.avatar_url || "", // Z raw_user_meta_data, jeśli istnieje
//           });
//         } else {
//           clearUser();
//         }
//       } catch (error) {
//         console.error("Unexpected error:", error);
//         clearUser();
//       }
//     };

//     fetchUser();

//     // Subskrypcja na zmiany stanu autoryzacji
//     const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
//       if (event === "SIGNED_IN" && session?.user) {
//         setUser({
//           id: session.user.id,
//           email: session.user.email!,
//           name: session.user.user_metadata?.name || "User",
//           avatar: session.user.user_metadata?.avatar_url || "",
//         });
//       } else if (event === "SIGNED_OUT") {
//         clearUser();
//       }
//     });

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, [setUser, clearUser, setLoading]);

//   return null; // Komponent nie renderuje nic w UI
// }