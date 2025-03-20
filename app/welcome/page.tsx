// app/welcome/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function WelcomePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleFreePlan = async () => {
    startTransition(async () => {
      try {
        console.log("Wysyłanie żądania POST na /api/subscribe");
        const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan: "free" }),
        });

        if (response.ok) {
          console.log("Subskrypcja utworzona, przekierowanie na /home");
          router.push("/home");
        } else {
          const errorText = await response.text();
          console.error("Błąd podczas tworzenia subskrypcji:", errorText);
        }
      } catch (error) {
        console.error("Błąd w żądaniu fetch:", error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Witaj! Wybierz swój plan</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Free</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Darmowy plan z podstawowymi funkcjami:
              </p>
              <ul className="list-disc pl-5 mt-2">
                <li>10 ofert miesięcznie</li>
                <li>3 kreatory CV</li>
                <li>Podstawowe wsparcie</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleFreePlan}
                disabled={isPending}
                className="w-full"
              >
                {isPending ? "Tworzenie..." : "Wybierz Free"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pełny dostęp do wszystkich funkcji:
              </p>
              <ul className="list-disc pl-5 mt-2">
                <li>Nieograniczone oferty</li>
                <li>Nieograniczone kreatory CV</li>
                <li>Priorytetowe wsparcie</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button disabled className="w-full">
                Wybierz Premium (Wkrótce)
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}