import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role as Role) ?? "viewer";
  return {
    id: user.id,
    email: user.email,
    name: profile?.name ?? user.email?.split("@")[0] ?? "",
    role,
    isAdmin: role === "admin",
    isAuthor: role === "author" || role === "admin",
  };
}
