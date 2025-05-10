// lib/gemini-client.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicjalizacja klienta Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Sprawdzenie klucza API
if (!GEMINI_API_KEY) {
  console.error("❌ BŁĄD: Brak klucza API Gemini (GOOGLE_API_KEY) w zmiennych środowiskowych!");
}

export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Funkcja do tworzenia modelu z instrukcją systemową
export function createModel(modelName: string, systemInstruction: string) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Brak klucza API Gemini (GEMINI_API_KEY)");
    }
    
    console.log(`🤖 Gemini: Tworzenie modelu ${modelName}`);
    
    return genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
    });
  } catch (error) {
    console.error(`❌ Gemini: Błąd tworzenia modelu ${modelName}:`, error);
    throw new Error(`Nie udało się utworzyć modelu Gemini: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Funkcja do wyświetlania statystyk tokenów
export function logTokenUsage(response: any) {
    const usage = response.usageMetadata;
  
    if (!usage) {
      console.warn("⚠️ Brak informacji o zużyciu tokenów");
      return null;
    }
  
    console.log(`📊 Tokeny - prompt: ${usage.promptTokenCount}, output: ${usage.candidatesTokenCount}, suma: ${usage.totalTokenCount}`);
  
    return {
      promptTokens: usage.promptTokenCount,
      outputTokens: usage.candidatesTokenCount,
      totalTokens: usage.totalTokenCount
    };
  }