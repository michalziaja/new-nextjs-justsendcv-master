"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Klient Supabase po stronie klienta
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { deleteAccountAction } from "@/app/actions";
import { UserData } from "@/app/types";

interface AccountManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: UserData;
}

export function AccountManagement({
  open,
  onOpenChange,
  userData,
}: AccountManagementProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const supabase = createClient();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("Nowe hasło musi mieć co najmniej 6 znaków.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Hasło zostało zmienione!");
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccountAction(userData.id);
    if (error) {
      setError(error);
    } else {
      // Po usunięciu konta wyloguj i przekieruj
      await supabase.auth.signOut();
      window.location.href = "/";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zarządzanie kontem</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Informacje o koncie */}
          <div>
            <h3 className="font-medium">Informacje o koncie</h3>
            <p><strong>E-mail:</strong> {userData.email}</p>
            <p><strong>Nazwa:</strong> {userData.name}</p>
            <p><strong>Data założenia:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
            <p><strong>Subskrypcja:</strong> {userData.isSubscribed ? "Premium" : "Brak"}</p>
          </div>

          {/* Zmiana hasła */}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <h3 className="font-medium">Zmień hasło</h3>
            <div>
              <Label htmlFor="current-password">Obecne hasło</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-password">Nowe hasło</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
            <Button type="submit">Zmień hasło</Button>
          </form>

          {/* Usunięcie konta */}
          <div>
            <h3 className="font-medium text-red-500">Usuń konto</h3>
            {deleteConfirm ? (
              <div>
                <p>Czy na pewno chcesz usunąć konto? Tej akcji nie można cofnąć.</p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="mt-2"
                >
                  Tak, usuń konto
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(false)}
                  className="mt-2 ml-2"
                >
                  Anuluj
                </Button>
              </div>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setDeleteConfirm(true)}
              >
                Usuń konto
              </Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}