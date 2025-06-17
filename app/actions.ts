"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface ProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  fullName?: string;
  // Dodaj inne pola, które mogą być potrzebne
  social_links?: string;
  about_me?: string;
  avatar?: string;
}

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const supabase = await createClient();
  // const origin = (await headers()).get("origin");
  const origin = process.env.NEXT_PUBLIC_URL || "https://83e2-2a01-115f-4902-7900-8d6e-e943-9c59-b01e.ngrok-free.app";

  if (!email || !password || !firstName || !lastName) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Wszystkie pola są wymagane: email, hasło, imię i nazwisko",
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName
      }
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        user_id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email
      });

    if (profileError) {
      console.error("Błąd podczas tworzenia profilu:", profileError.message);
    }

    // Sprawdź czy użytkownik ma już subskrypcję
    const { data: existingSubscription, error: subFetchError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", data.user.id)
      .single();

    if (subFetchError && subFetchError.code !== "PGRST116") {
      console.error("Błąd podczas sprawdzania subskrypcji:", subFetchError.message);
    }

    // Jeśli nie ma subskrypcji, utwórz darmową
    if (!existingSubscription) {
      const { error: subError } = await supabase.from("subscriptions").insert({
        user_id: data.user.id,
        plan: "free",
        status: "active",
        start_date: new Date().toISOString(),
        current_limit: 10,
        total_limit: 20,
        cv_creator_limit: 3,
        cv_creator_used: 0,
        current_offers: 0,
        total_offers: 0,
      });

      if (subError) {
        console.error("Błąd podczas tworzenia subskrypcji:", subError.message);
      } else {
        console.log("Utworzono darmową subskrypcję dla użytkownika:", data.user.id);
      }
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Dziękujemy za rejestrację! Sprawdź swoją skrzynkę email, aby zweryfikować konto.",
  );
};

// Pozostałe akcje pozostają bez zmian
export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/home");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", "Nie udało się uwierzytelnić użytkownika");
  }

  // Przekierowanie na URL Google do autoryzacji
  return redirect(data.url);
}

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};

export async function deleteAccountAction(userId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.admin.deleteUser(userId);
  
  if (error) {
    return { error: error.message };
  }
  
  return { success: true };
}

// Action do zapisywania emaila na liście oczekujących
export const addToWaitlistAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  
  if (!email) {
    return { error: "Email jest wymagany" };
  }

  // Walidacja formatu email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Proszę podać prawidłowy adres email" };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase().trim(),
        source: 'landing_form'
      });

    if (error) {
      if (error.code === '23505') {
        return { error: "Ten adres email jest już na liście oczekujących!" };
      }
      console.error('Waitlist error:', error);
      return { error: "Wystąpił błąd podczas zapisywania. Spróbuj ponownie." };
    }

    return { success: true };
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: "Wystąpił nieoczekiwany błąd" };
  }
};

export async function updateUserProfileAction(userId: string, profileData: ProfileData) {
  const supabase = await createClient();
  
  const { data: existingProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') {
    return { error: "Błąd podczas pobierania profilu: " + fetchError.message };
  }
  
  let result;
  
  if (existingProfile) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("user_id", userId);
    
    if (updateError) {
      return { error: "Błąd podczas aktualizacji profilu: " + updateError.message };
    }
    
    result = { success: true, message: "Profil został zaktualizowany" };
  } else {
    const { error: insertError } = await supabase
      .from("profiles")
      .insert([{ user_id: userId, ...profileData }]);
    
    if (insertError) {
      return { error: "Błąd podczas tworzenia profilu: " + insertError.message };
    }
    
    result = { success: true, message: "Profil został utworzony" };
  }
  
  if (profileData.fullName) {
    const { error: updateUserError } = await supabase.auth.updateUser({
      data: { name: profileData.fullName }
    });
    
    if (updateUserError) {
      return { 
        warning: "Profil zaktualizowany, ale wystąpił błąd podczas aktualizacji metadanych: " + updateUserError.message,
        success: true 
      };
    }
  }
  
  return result;
}