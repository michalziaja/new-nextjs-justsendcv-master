"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setIsVerifying(true);
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
          console.error("Brak identyfikatora sesji");
          setIsSuccess(false);
          setIsVerifying(false);
          return;
        }

        // Weryfikacja sesji płatności
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          setIsSuccess(true);
        } else {
          console.error("Błąd weryfikacji płatności:", data.error);
          setIsSuccess(false);
        }
      } catch (error) {
        console.error("Wystąpił błąd podczas weryfikacji płatności:", error);
        setIsSuccess(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Weryfikacja płatności...</h1>
        <p className="text-muted-foreground">Prosimy o cierpliwość, weryfikujemy Twoją płatność.</p>
      </div>
    );
  }

  if (!isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Wystąpił problem</CardTitle>
            <CardDescription>
              Nie mogliśmy zweryfikować Twojej płatności. Jeśli widzisz ten komunikat pomimo pomyślnego dokonania płatności, prosimy o kontakt z obsługą klienta.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/home")}>
              Wróć do pulpitu
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl mb-2">Płatność zakończona pomyślnie!</CardTitle>
          <CardDescription>
            Dziękujemy za zakup planu Premium! Twoje konto zostało zaktualizowane, możesz teraz korzystać ze wszystkich funkcji JustSend.cv.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full" 
            onClick={() => router.push("/home")}
          >
            Przejdź do pulpitu
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 