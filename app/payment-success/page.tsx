"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-50/30 via-gray-100 to-cyan-50/30 dark:from-[#0A0F1C] dark:via-[#1A2338] dark:to-gray-900 relative">
      {/* Przełącznik motywu */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Tło z efektami */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808011_1px,transparent_1px),linear-gradient(to_bottom,#80808011_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
        <div className="absolute top-30 right-20 w-40 h-40 rounded-full bg-gray-100 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute top-48 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-cyan-600/80 to-transparent dark:via-cyan-500/30" />
      </div>

      {isVerifying ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-[#00B2FF] mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Weryfikacja płatności...</h1>
          <p className="text-gray-600 dark:text-gray-300">Prosimy o cierpliwość, weryfikujemy Twoją płatność.</p>
        </motion.div>
      ) : !isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md p-4"
        >
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2 text-gray-900 dark:text-white">Wystąpił problem</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Nie mogliśmy zweryfikować Twojej płatności. Jeśli widzisz ten komunikat pomimo pomyślnego dokonania płatności, prosimy o kontakt z obsługą klienta.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button
                className="bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                onClick={() => router.push("/home")}
              >
                Wróć do pulpitu
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md p-4"
        >
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl mb-2 text-gray-900 dark:text-white">Płatność zakończona pomyślnie!</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Dziękujemy za zakup planu Premium! Twoje konto zostało zaktualizowane, możesz teraz korzystać ze wszystkich funkcji JustSend.cv.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                className="w-full bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                onClick={() => router.push("/home")}
              >
                Przejdź do pulpitu
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
} 