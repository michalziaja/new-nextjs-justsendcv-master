"use client"

import { signInAction, signInWithGoogle } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Login() {
  return (
    <div className="w-full">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-foreground">Zaloguj się do </span>
            <span className="text-primary">konta</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Wprowadź swoje dane, aby się zalogować
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-4 mt-10">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jan.kowalski@example.com"
                required
                className="text-sm md:text-sm w-full backdrop-blur-sm bg-white dark:bg-background"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Hasło</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/90 transition-colors hover:scale-105 "
                >
                  Zapomniałeś hasła?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Wprowadź hasło"
                required
                className="w-full text-sm md:text-sm bg-white dark:bg-background backdrop-blur-sm"
              />
            </div>
          </div>

          <SubmitButton
            pendingText="Logowanie..."
            formAction={signInAction}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Zaloguj się
          </SubmitButton>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-[#0A0F1C] text-muted-foreground">lub</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 py-6 bg-white hover:bg-gray-50 dark:bg-[#0A0F1C] dark:hover:bg-[#0A0F1C]/80 border-2 hover:border-[#00B2FF] dark:hover:border-[#00B2FF] border-gray-200 dark:border-gray-800 hover:scale-105 transition-transform"
          onClick={() => signInWithGoogle()}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Zaloguj się przez Google
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Nie masz jeszcze konta?{" "}
            <Link
              href="/sign-up"
              className="text-gray-900 hover:text-[#00B2FF] dark:text-gray-200 dark:hover:text-[#00B2FF] transition-colors font-medium hover:scale-105"
            >
              Zarejestruj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
