import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Sprawdzenie autoryzacji użytkownika
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pobranie liczby ofert użytkownika
    const { count, error: countError } = await supabase
      .from("job_offers")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("Błąd pobierania liczby ofert:", countError);
      return NextResponse.json(
        { error: "Błąd pobierania danych" },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: count || 0 });

  } catch (error) {
    console.error("Błąd endpoint count:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
} 