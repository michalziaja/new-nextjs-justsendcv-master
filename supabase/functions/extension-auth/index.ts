// supabase/functions/subscription/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

serve(async (req: Request) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Brak autoryzacji" }), { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: user, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Nieprawidłowy token" }), { status: 401 });
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan, cv_creator_limit, cv_creator_used")
    .eq("user_id", user.user.id)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: "Błąd pobierania subskrypcji" }), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});