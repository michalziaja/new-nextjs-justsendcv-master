"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function AuthRequiredPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/sign-in");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800"
      >
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Musisz się zalogować
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Za 3 sekundy zostaniesz przekierowany do strony logowania...
        </p>
        <Button
          className="bg-gradient-to-r from-[#00B2FF] to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
          onClick={() => router.push("/sign-in")}
        >
          Przejdź do logowania
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}