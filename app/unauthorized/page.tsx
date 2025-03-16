"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AuthRequiredPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/sign-in");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Musisz się zalogować
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Za 3 sekundy zostaniesz przekierowany do strony logowania...
        </p>
      </motion.div>
    </div>
  );
}