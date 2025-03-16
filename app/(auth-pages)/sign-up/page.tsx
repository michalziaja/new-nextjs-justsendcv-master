"use client"

import { signUpAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Signup() {
  return (
    <div className="w-full">
      {/* <Link 
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do strony głównej
      </Link> */}

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
                required
                className="w-full bg-background/50 backdrop-blur-sm"
              />
            </div>
          </div>

          <SubmitButton 
            formAction={signUpAction} 
            pendingText="Rejestracja..."
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Zarejestruj się
          </SubmitButton>
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
