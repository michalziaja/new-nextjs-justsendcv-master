"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, ArrowLeft, Zap, CalendarCheck, Star, Shield, Bot, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Dane planów
const plans = [
  {
    id: "premium_weekly",
    name: "Premium Tygodniowy",
    price: "8",
    period: "zł/tydz",
    description: "Idealny na krótki okres poszukiwań",
    features: [
      "100 zapisanych ofert pracy",
      "10 szablonów CV",
      "Podstawowe statystyki",
      "Dostęp do asystenta AI",
      "Wsparcie e-mail",
      "Wtyczka do przeglądarki"
    ],
    icon: Clock,
    popular: false,
    interval: "week",
    cta: "Wybierz plan tygodniowy"
  },
  {
    id: "premium_monthly",
    name: "Premium Miesięczny",
    price: "29",
    period: "zł/msc",
    description: "Pełny dostęp do wszystkich funkcji",
    features: [
      "100 zapisanych ofert pracy",
      "50 szablonów CV",
      "Zaawansowane statystyki",
      "Nielimitowany dostęp do asystenta AI",
      "Priorytetowe wsparcie",
      "Wtyczka do przeglądarki"
    ],
    icon: Zap,
    popular: true,
    interval: "month",
    cta: "Wybierz plan miesięczny"
  },
  {
    id: "premium_quarterly",
    name: "Premium Kwartalny",
    price: "79",
    period: "zł/kwartał",
    description: "Oszczędź 10% w porównaniu do planu miesięcznego",
    features: [
      "100 zapisanych ofert pracy",
      "50 szablonów CV",
      "Zaawansowane statystyki",
      "Nielimitowany dostęp do asystenta AI",
      "Priorytetowe wsparcie",
      "Wtyczka do przeglądarki",
      "1 miesiąc gratis"
    ],
    icon: CalendarCheck,
    popular: false,
    interval: "quarter",
    cta: "Wybierz plan kwartalny"
  }
];

// Korzyści Premium
const benefits = [
  {
    title: "Więcej możliwości",
    description: "Plan Premium oferuje znacznie większe limity zapisanych ofert, szablonów CV i dostęp do zaawansowanych funkcji.",
    icon: Zap
  },
  {
    title: "Asystent AI bez ograniczeń",
    description: "Korzystaj z nielimitowanego dostępu do asystenta AI, który pomoże Ci w przygotowaniu CV i listów motywacyjnych.",
    icon: Bot
  },
  {
    title: "Priorytetowe wsparcie",
    description: "Użytkownicy Premium otrzymują priorytetowe wsparcie techniczne oraz dostęp do dedykowanego konsultanta.",
    icon: Star
  },
  {
    title: "Bezpieczeństwo danych",
    description: "Zaawansowane szyfrowanie i ochrona Twoich danych osobowych i dokumentów.",
    icon: Shield
  }
];

export default function UpgradePage() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ id: string; email?: string } | null>(null);
  
  // Referencje do sekcji i stany widoczności
  const pricingRef = useRef<HTMLDivElement>(null);
  const isPricingInView = useInView(pricingRef, { once: true, amount: 0.2 });

  // Animacje
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  const itemFadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };
  
  // Animacja dla Pricing Section
  const pricingAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1,
      },
    },
  };

  const pricingItemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  useEffect(() => {
    const checkUserAndSubscription = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setIsCheckingSubscription(false);
          setIsEligible(false);
          router.push("/unauthorized");
          return;
        }

        setUserData(user);

        startTransition(async () => {
          try {
            // Sprawdź aktualną subskrypcję użytkownika
            const { data: subscriptionData, error: subscriptionError } = await supabase
              .from("subscriptions")
              .select("*")
              .eq("user_id", user.id)
              .single();

            if (subscriptionError && subscriptionError.code !== 'PGRST116') {
              console.error("Błąd pobierania subskrypcji:", subscriptionError);
              setIsEligible(false);
              setIsCheckingSubscription(false);
              return;
            }

            // Użytkownik jest uprawniony tylko, jeśli ma plan "free" lub nie ma subskrypcji
            if (!subscriptionData || subscriptionData.plan === "free") {
              setIsEligible(true);
            } else {
              // Jeśli ma już plan premium, przekieruj na dashboard
              router.push("/home");
            }
          } catch (error) {
            console.error("Błąd podczas sprawdzania subskrypcji:", error);
            setIsEligible(false);
          } finally {
            setIsCheckingSubscription(false);
          }
        });
      } catch (error) {
        console.error("Błąd podczas sprawdzania sesji:", error);
        setIsEligible(false);
        setIsCheckingSubscription(false);
      }
    };

    checkUserAndSubscription();
  }, [supabase, router, startTransition]);

  const handleStripeCheckout = async (plan: typeof plans[0]) => {
    if (!isEligible || !userData) {
      alert("Nie możesz uaktualnić planu – posiadasz już plan Premium lub nie masz uprawnień.");
      return;
    }

    try {
      setLoading(true);
      setSelectedPlan(plan.id);
      
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planId: plan.id,
          userId: userData.id,
          interval: plan.interval
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Nie udało się zainicjować płatności");
      }
      
      if (!data.sessionId) {
        throw new Error("Nie otrzymano identyfikatora sesji płatności");
      }
      
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Nie udało się załadować Stripe");
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Błąd podczas inicjowania płatności:", error);
      alert("Wystąpił błąd podczas inicjowania płatności. Spróbuj ponownie później.");
    } finally {
      setLoading(false);
    }
  };

  // Wyświetlaj spinner, dopóki isCheckingSubscription lub isPending są true
  if (isCheckingSubscription || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-50/30 via-gray-100 to-cyan-50/30 dark:from-[#0A0F1C] dark:via-[#1A2338] dark:to-gray-900">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808011_1px,transparent_1px),linear-gradient(to_bottom,#80808011_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
          <div className="absolute top-30 right-20 w-40 h-40 rounded-full bg-gray-100 dark:bg-blue-500/10 blur-3xl" />
        </div>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <span className="text-xl font-medium">Ładowanie...</span>
        </div>
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-cyan-50/30 via-gray-100 to-cyan-50/30 dark:from-[#0A0F1C] dark:via-[#1A2338] dark:to-gray-900 flex flex-col items-center justify-center p-4 relative">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808011_1px,transparent_1px),linear-gradient(to_bottom,#80808011_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
          <div className="absolute top-30 right-20 w-40 h-40 rounded-full bg-gray-100 dark:bg-blue-500/10 blur-3xl" />
        </div>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="relative z-10 text-center max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Brak uprawnień</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Posiadasz już plan Premium lub nie masz uprawnień do uaktualnienia. Skontaktuj się z pomocą techniczną, jeśli potrzebujesz pomocy.
          </p>
          <Button
            className="bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            onClick={() => router.push("/home")}
          >
            Powrót do pulpitu
          </Button>
        </div>
      </div>
    );
  }

  // Jeśli użytkownik jest uprawniony, wyświetl interfejs wyboru planu
  return (
    <div className="min-h-screen justify-center bg-gradient-to-r from-cyan-50/30 via-gray-100 to-cyan-50/30 dark:from-[#0A0F1C] dark:via-[#1A2338] dark:to-gray-900 flex flex-col items-center p-4 sm:py-8 relative">
      {/* Przełącznik motywu */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Tło z subtelnym efektem siatki i dekoracjami */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Siatka w tle - subtelny wzór linii dla tekstury */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808011_1px,transparent_1px),linear-gradient(to_bottom,#80808011_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
        {/* Subtelne koło w prawym dolnym rogu - dekoracyjny akcent */}
        <div className="absolute top-30 right-20 w-40 h-40 rounded-full bg-gray-100 dark:bg-blue-500/10 blur-3xl" />
        {/* Linia pozioma w górnej części - subtelny separator */}
        <div className="absolute top-48 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-cyan-600/80 to-transparent dark:via-cyan-500/30" />
        {/* Linia pozioma w dolnej części - subtelny separator */}
        <div className="absolute bottom-50 right-0 w-1/3 h-px bg-gradient-to-l from-transparent via-cyan-500/80 to-transparent dark:via-cyan-500/30" />
      </div>

      <div className="container mx-auto px-4  relative z-10">
        <motion.div 
          className="max-w-7xl mx-auto" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="text-gray-900 dark:text-white">Przejdź na </span>
              <span className="text-[#00B2FF] drop-shadow-md">Premium</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Odblokuj pełen potencjał JustSend.cv i zwiększ swoje szanse na znalezienie wymarzonej pracy
            </p>
          </div>

          <div className="grid grid-cols-1 pt-6 md:grid-cols-3 gap-8 w-full mx-auto max-w-5xl">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={cn(
                  "relative bg-white dark:bg-[#0A0F1C] rounded-3xl shadow-lg transition-all duration-300 border h-full flex flex-col hover:-translate-y-2",
                  plan.popular
                    ? "border-[#00B2FF] md:scale-105 z-10 shadow-xl shadow-[#00B2FF]/20 hover:shadow-2xl hover:shadow-[#00B2FF]/30 hover:border-2"
                    : "border-gray-200 dark:border-gray-800 hover:shadow-xl hover:shadow-blue-500/10 hover:border-gray-300 dark:hover:border-gray-700"
                )}
              >
                {/* Wyróżnienie planu popularnego */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white px-4 py-1 rounded-full text-xs font-medium shadow-md">
                    Polecany
                  </div>
                )}

                <div className="flex flex-col h-full p-5">
                  {/* Nagłówek planu */}
                  <div className="text-center mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
                    <h3
                      className={cn(
                        "text-xl font-bold mb-1.5",
                        plan.popular ? "text-[#00B2FF]" : "text-gray-900 dark:text-white"
                      )}
                    >
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">{plan.period}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{plan.description}</p>
                  </div>

                  {/* Lista funkcji */}
                  <ul className="space-y-3 mb-6 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div
                          className={cn(
                            "h-4 w-4 rounded-full flex items-center justify-center mt-0.5",
                            plan.popular
                              ? "bg-[#00B2FF] text-white"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          )}
                        >
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Przycisk CTA */}
                  <Button
                    className={cn(
                      "w-full mt-auto rounded-full py-4 text-sm font-medium transition-all duration-300",
                      plan.popular
                        ? "bg-gradient-to-r from-[#00B2FF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:shadow-[#00B2FF]/50"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gradient-to-r hover:from-[#00B2FF] hover:to-blue-600 hover:text-white dark:hover:text-white"
                    )}
                    onClick={() => handleStripeCheckout(plan)}
                    disabled={loading && selectedPlan === plan.id}
                  >
                    {loading && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                        Przetwarzanie...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 mx-auto max-w-3xl pt-6">
            <div className="bg-white/50 dark:bg-[#0A0F1C]/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-md">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                  <Shield className="h-6 w-6 text-[#00B2FF]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white text-center md:text-left">Bezpieczne płatności</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-center md:text-left">
                    Wszystkie płatności są przetwarzane przez Stripe - jednego z najbezpieczniejszych dostawców płatności online. Twoje dane karty są zawsze chronione.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/home")}
              className="flex items-center gap-2 text-sm hover:scale-105 text-gray-700 dark:text-gray-300 hover:text-[#00B2FF] hover:bg-transparent dark:hover:text-[#00B2FF]"
            >
              <ArrowLeft className="h-4 w-4" />
              Powrót do pulpitu
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}