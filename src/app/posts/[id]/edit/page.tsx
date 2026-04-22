import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PostEditor } from "@/components/PostEditor";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const supabase = createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("id, title, body, image_url, author_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!post) notFound();
  if (!me.isAdmin && post.author_id !== me.id) redirect("/?err=forbidden");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Edit post</h1>
      <PostEditor mode="edit" post={post} />
    </div>
  );
}
