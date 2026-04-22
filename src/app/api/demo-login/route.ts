import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DEMO_PASSWORD = "demo1234";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  if (!email) return NextResponse.redirect(new URL("/login?err=missing-email", req.url));

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: DEMO_PASSWORD });
  if (error) {
    const url = new URL("/login", req.url);
    url.searchParams.set("err", error.message);
    return NextResponse.redirect(url, { status: 303 });
  }
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
