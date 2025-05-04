"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AccountManagement } from "@/components/account-managment";
import { UserData } from "@/app/types";

// Komponent po stronie klienta do obsługi dialogu zarządzania kontem
export default function AccountManagementClient({ userData }: { userData: UserData }) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Zarządzaj kontem
      </Button>
      <AccountManagement
        open={open}
        onOpenChange={setOpen}
        userData={userData}
      />
    </>
  );
} 