import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSummary } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.body) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  // Fetch existing post to detect body change (regenerate summary only if needed).
  const { data: existing, error: fetchErr } = await supabase
    .from("posts")
    .select("body, summary")
    .eq("id", params.id)
    .maybeSingle();
  if (fetchErr || !existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Cost optimization: only regenerate summary when body actually changes.
  let summary = existing.summary;
  if (existing.body !== body.body) {
    summary = await generateSummary(body.title, body.body);
  }

  const { error } = await supabase
    .from("posts")
    .update({
      title: body.title,
      body: body.body,
      image_url: body.image_url ?? null,
      summary,
    })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: params.id });
}
