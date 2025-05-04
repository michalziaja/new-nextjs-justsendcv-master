"use client"

import { signUpAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useState } from "react";

export default function Signup() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordMatch(e.target.value === confirmPassword);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(password === e.target.value);
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-foreground">Utwórz </span>
            <span className="text-primary">konto</span>
          </h1>
          <p className="text-muted-foreground">
            Wprowadź swoje dane, aby utworzyć konto
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Imię</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Jan"
                required
                className="w-full bg-white dark:bg-background backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nazwisko</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Kowalski"
                required
                className="w-full bg-white dark:bg-background backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jan.kowalski@example.com"
                required
                className="w-full bg-white dark:bg-background backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Minimum 6 znaków"
                minLength={6}
                value={password}
                onChange={handlePasswordChange}
                required
                className="w-full bg-background/50 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Powtórz hasło</Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Powtórz hasło"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                className={`w-full bg-background/50 backdrop-blur-sm ${
                  !passwordMatch && confirmPassword ? "border-red-500" : ""
                }`}
              />
              {!passwordMatch && confirmPassword && (
                <p className="text-sm text-red-500">Hasła nie są zgodne</p>
              )}
            </div>
          </div>

          <SubmitSignupButton disabled={!passwordMatch} />
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Masz już konto?{" "}
            <Link
              href="/sign-in"
              className="text-primary hover:text-primary/90 transition-colors font-medium"
            >
              Zaloguj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

interface SubmitSignupButtonProps {
  disabled: boolean;
}

function SubmitSignupButton({ disabled }: SubmitSignupButtonProps) {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      aria-disabled={pending || disabled}
      disabled={pending || disabled}
      formAction={signUpAction}
      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {pending ? "Rejestracja..." : "Zarejestruj się"}
    </Button>
  );
}