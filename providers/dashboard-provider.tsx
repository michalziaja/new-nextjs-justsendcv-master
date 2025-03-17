// "use client";

// import { useEffect } from "react";
// import { useUserStore } from "@/store/userStore";

// type UserData = {
//   id: string;
//   name: string;
//   email: string;
//   avatar: string;
// };

// export default function DashboardProvider({
//   userData,
//   children,
// }: {
//   userData: UserData;
//   children: React.ReactNode;
// }) {
//   const { user, setUser } = useUserStore();

//   useEffect(() => {
//     if (!user || user.id !== userData.id) {
//       setUser(userData);
//     }
//   }, [userData, user, setUser]);

//   return <>{children}</>;
// }