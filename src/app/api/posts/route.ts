import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSummary } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.body) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  // Generate AI summary ONCE on creation, then store it.
  // This avoids repeated API calls when the post is later viewed.
  const summary = await generateSummary(body.title, body.body);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: body.title,
      body: body.body,
      image_url: body.image_url ?? null,
      summary,
      author_id: user.id,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}
