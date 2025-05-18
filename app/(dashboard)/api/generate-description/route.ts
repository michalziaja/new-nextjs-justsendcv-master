import { NextRequest, NextResponse } from "next/server";
import { generateProfileDescription } from "@/lib/profile-description-generator";

export async function POST(req: NextRequest) {
  console.log("🚀 Rozpoczęcie generowania opisu profilu przez API");
  const startTime = Date.now();
  
  try {
    // Pobranie danych z żądania
    const data = await req.json();
    const { jobTitle, userDescription, experience, skills } = data;
    
    if (!jobTitle) {
      console.error("❌ Brak nazwy stanowiska");
      return NextResponse.json(
        { error: "Brak nazwy stanowiska. To pole jest wymagane." },
        { status: 400 }
      );
    }
    
    console.log(`📝 Generowanie opisu dla stanowiska: ${jobTitle}`);
    
    // Wywołanie generatora opisu
    const generatedDescription = await generateProfileDescription(
      jobTitle,
      userDescription,
      experience,
      skills
    );
    
    const endTime = Date.now();
    console.log(`✅ Wygenerowano opis profilu w czasie ${(endTime - startTime) / 1000} sekund`);
    
    return NextResponse.json({ description: generatedDescription });
  } catch (error: any) {
    console.error("❌ Błąd generowania opisu profilu:", error);
    
    const endTime = Date.now();
    console.log(`❌ Generowanie opisu zakończone niepowodzeniem po ${(endTime - startTime) / 1000} sekundach`);
    
    return NextResponse.json(
      { 
        error: "Wystąpił błąd podczas generowania opisu profilu.",
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
} 