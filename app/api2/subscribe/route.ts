// // app/api/subscribe/route.ts
// import { createClient } from "@/utils/supabase/server";
// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//   const supabase = await createClient();
//   const { data: { user }, error: authError } = await supabase.auth.getUser();

//   if (authError || !user) {
//     console.error("Brak autoryzowanego użytkownika:", authError?.message);
//     return NextResponse.json({ error: "Nieautoryzowany użytkownik" }, { status: 401 });
//   }

//   const { plan } = await request.json();

//   if (plan !== "free") {
//     console.error("Nieobsługiwany plan:", plan);
//     return NextResponse.json({ error: "Plan nieobsługiwany" }, { status: 400 });
//   }

//   const { error: subError } = await supabase.from("subscriptions").insert({
//     user_id: user.id,
//     plan: "free",
//     status: "active",
//     start_date: new Date().toISOString(),
//     current_limit: 10,
//     total_limit: 20,
//     cv_creator_limit: 3,
//     cv_creator_used: 0,
//     current_offers: 0,
//     total_offers: 0,
//   });

//   if (subError) {
//     console.error("Błąd podczas tworzenia subskrypcji:", subError.message);
//     return NextResponse.json({ error: "Błąd podczas tworzenia subskrypcji" }, { status: 500 });
//   }

//   console.log("Subskrypcja utworzona dla użytkownika:", user.id);
//   return NextResponse.json({ success: true }, { status: 200 });
// }