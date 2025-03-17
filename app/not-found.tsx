"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";


export default function NotFound() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push("/home");
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen w-full relative border-r border-gray-300/80 dark:border-gray-800 bg-gradient-to-r from-gray-100 via-cyan-50/50 to-gray-100 dark:from-[#0A0F1C] dark:via-[#1A2338] dark:to-gray-900 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6 drop-shadow-lg">
            <img 
              src="/logo.png" 
              alt="JustSend.cv Logo" 
              className="relative w-full h-full transition-transform hover:scale-105" 
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
              Ups! Nie znaleziono strony
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Przepraszamy, ale strona której szukasz nie istnieje lub została przeniesiona.
            </p>
          </div>
        </div>
      </div>

      {/* Elementy dekoracyjne */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-20 right-30 w-40 h-40 rounded-full bg-blue-500/10 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/4 left-0 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-600/50 to-transparent dark:via-cyan-500/30" />
        <div className="absolute bottom-1/3 right-0 w-1/3 h-px bg-gradient-to-l from-transparent via-cyan-600/50 to-transparent dark:via-blue-500/30" />
        <div className="absolute top-20 right-32 w-16 h-16 rotate-45 border border-gray-300/80 dark:border-cyan-500/10" />
        <div className="absolute bottom-32 left-20 w-24 h-24 rotate-45 border border-gray-300/80 dark:border-cyan-500/10" />
      </div>

    </div>
  );
} 