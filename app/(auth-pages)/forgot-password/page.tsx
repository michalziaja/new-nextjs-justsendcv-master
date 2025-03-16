"use client"

import { forgotPasswordAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
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
            <span className="text-foreground">Resetowanie </span>
            <span className="text-primary">hasła</span>
          </h1>
          <p className="text-muted-foreground">
            Wprowadź swój adres email, aby zresetować hasło
          </p>
        </div>

        <form className="space-y-4">
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

          <SubmitButton 
            formAction={forgotPasswordAction}
            pendingText="Wysyłanie..."
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Wyślij link resetujący
          </SubmitButton>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Pamiętasz hasło?{" "}
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
