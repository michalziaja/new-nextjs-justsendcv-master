"use client";

import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { PaymentSuccessContent } from "./payment-success-content";

export default function PaymentSuccessPage() {
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

      <Suspense fallback={
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-12 w-12 animate-spin text-[#00B2FF] mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Ładowanie...</h1>
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
} 