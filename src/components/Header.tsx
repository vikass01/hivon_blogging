import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

export async function Header() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role = "viewer";
  let name = "";
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("name, role")
      .eq("id", user.id)
      .maybeSingle();
    role = (profile?.role as string) ?? "viewer";
    name = profile?.name ?? user.email?.split("@")[0] ?? "";
  }

  const isAuthor = role === "author" || role === "admin";
  const isAdmin = role === "admin";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          <span className="text-brand-600">Hivon</span> Blog
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/" className="btn-ghost text-sm">Home</Link>
          {isAuthor && (
            <Link href="/posts/new" className="btn-ghost text-sm">New post</Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="btn-ghost text-sm">Admin</Link>
          )}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="hidden sm:inline text-sm text-zinc-600">
                {name} · <span className="text-brand-600 font-medium">{role}</span>
              </span>
              <LogoutButton />
            </div>
          ) : (
            <Link href="/login" className="btn-primary text-sm py-1.5">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
