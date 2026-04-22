import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { CommentSection } from "@/components/CommentSection";
import { DeletePostButton } from "@/components/DeletePostButton";

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const me = await getCurrentUser();

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, body, image_url, summary, author_id, created_at, updated_at, author:users!posts_author_id_fkey(id, name)")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !post) notFound();

  const canEdit = !!me && (me.isAdmin || me.id === post.author_id);

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/" className="text-sm text-brand-600 hover:underline">← Back to posts</Link>
      <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">{post.title}</h1>
      <p className="mt-2 text-sm text-zinc-500">
        By {(post as any).author?.name ?? "Unknown"} · {new Date(post.created_at).toLocaleDateString()}
      </p>

      {canEdit && (
        <div className="mt-4 flex gap-2">
          <Link href={`/posts/${post.id}/edit`} className="btn-secondary text-sm">Edit</Link>
          <DeletePostButton postId={post.id} />
        </div>
      )}

      {post.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image_url} alt={post.title} className="mt-6 w-full rounded-2xl object-cover max-h-[420px]" />
      )}

      {post.summary && (
        <div className="mt-6 card p-5 bg-brand-50/50 border-brand-100">
          <p className="text-xs uppercase tracking-wide text-brand-700 font-semibold mb-2">AI Summary</p>
          <p className="text-zinc-700 prose-body">{post.summary}</p>
        </div>
      )}

      <div className="mt-8 prose-body text-zinc-800">{post.body}</div>

      <hr className="my-10 border-zinc-200" />

      <CommentSection postId={post.id} currentUserId={me?.id ?? null} isAdmin={!!me?.isAdmin} />
    </article>
  );
}
