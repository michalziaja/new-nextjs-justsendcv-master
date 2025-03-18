// // components/nav-user.tsx
// "use client";

// import {
//   BadgeCheck,
//   Bell,
//   ChevronsUpDown,
//   CreditCard,
//   LogOut,
//   Sparkles,
// } from "lucide-react";
// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
// } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import { useUserStore } from "@/store/userStore";
// import { signOutAction } from "@/app/actions";
// import { useState } from "react";


// export function NavUser() {
//   const { user, isLoading } = useUserStore();
//   const { isMobile } = useSidebar();
//   const [accountDialogOpen, setAccountDialogOpen] = useState(false);

//   if (isLoading) {
//     return (
//       <SidebarMenu>
//         <SidebarMenuItem>
//           <SidebarMenuButton size="lg">
//             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
//               {/* Placeholder dla avatara */}
//             </div>
//             <div className="grid flex-1 gap-1 text-left">
//               <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
//               <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
//             </div>
//           </SidebarMenuButton>
//         </SidebarMenuItem>
//       </SidebarMenu>
//     );
//   }

//   if (!user) {
//     return (
//       <SidebarMenu>
//         <SidebarMenuItem>
//           <SidebarMenuButton size="lg">Nie zalogowano</SidebarMenuButton>
//         </SidebarMenuItem>
//       </SidebarMenu>
//     );
//   }

//   return (
//     <>
//       <SidebarMenu>
//         <SidebarMenuItem>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <SidebarMenuButton
//                 size="lg"
//                 className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
//               >
//                 <Avatar className="h-8 w-8 rounded-lg">
//                   <AvatarImage src={user.avatar} alt={user.name} />
//                   <AvatarFallback className="rounded-lg">
//                     {user.name?.charAt(0) || "U"}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div className="grid flex-1 text-left text-sm leading-tight">
//                   <span className="truncate font-medium">{user.name}</span>
//                   <span className="truncate text-xs">{user.email}</span>
//                 </div>
//                 <ChevronsUpDown className="ml-auto size-4" />
//               </SidebarMenuButton>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent
//               className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
//               side={isMobile ? "bottom" : "right"}
//               align="end"
//               sideOffset={4}
//             >
//               <DropdownMenuLabel className="p-0 font-normal">
//                 <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
//                   <Avatar className="h-8 w-8 rounded-lg">
//                     <AvatarImage src={user.avatar} alt={user.name} />
//                     <AvatarFallback className="rounded-lg">
//                       {user.name?.charAt(0) || "U"}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="grid flex-1 text-left text-sm leading-tight">
//                     <span className="truncate font-medium">{user.name}</span>
//                     <span className="truncate text-xs">{user.email}</span>
//                   </div>
//                 </div>
//               </DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <DropdownMenuGroup>
//                 <DropdownMenuItem>
//                   <Sparkles />
//                   Ulepsz do Pro
//                 </DropdownMenuItem>
//               </DropdownMenuGroup>
//               <DropdownMenuSeparator />
//               <DropdownMenuGroup>
//                 <DropdownMenuItem onSelect={() => setAccountDialogOpen(true)}>
//                   <BadgeCheck />
//                   Konto
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <CreditCard />
//                   Płatności
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <Bell />
//                   Powiadomienia
//                 </DropdownMenuItem>
//               </DropdownMenuGroup>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={() => signOutAction()} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300">
//                 <LogOut />
//                 Wyloguj się
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </SidebarMenuItem>
//       </SidebarMenu>

//     </>
//   );
// }
"use client";

import Image from "next/image";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Crown,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOutAction } from "@/app/actions";
import { useState } from "react";


type UserData = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isSubscribed: boolean;
};

export function NavUser({ userData }: { userData: UserData }) {
  const { isMobile } = useSidebar();
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <Image
                    src={userData.avatar}
                    alt={userData.name}
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <AvatarFallback className="rounded-lg">
                    {userData.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userData.name}</span>
                  <span className="truncate text-xs">{userData.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <Image
                      src={userData.avatar}
                      alt={userData.name}
                      width={32}
                      height={32}
                      className="rounded-lg"
                    />
                    <AvatarFallback className="rounded-lg">
                      {userData.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{userData.name}</span>
                    <span className="truncate text-xs">{userData.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {userData.isSubscribed ? (
                  <DropdownMenuItem>
                    <Crown />
                    Posiadasz Premium
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <a href="/upgrade">
                      <Sparkles />
                      Ulepsz do Pro
                    </a>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => setAccountDialogOpen(true)}>
                  <BadgeCheck />
                  Konto
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard />
                  Płatności
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell />
                  Powiadomienia
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOutAction()}
                className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
              >
                <LogOut />
                Wyloguj się
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}