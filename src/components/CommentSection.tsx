"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CommentRow = {
  id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  user: { name: string } | null;
};

export function CommentSection({
  postId,
  currentUserId,
  isAdmin,
}: {
  postId: string;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const supabase = createClient();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("comments")
      .select("id, user_id, comment_text, created_at, user:users!comments_user_id_fkey(name)")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });
    setComments((data ?? []) as unknown as CommentRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUserId) return;
    setPosting(true);
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: currentUserId,
      comment_text: text.trim(),
    });
    setPosting(false);
    if (!error) {
      setText("");
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    await supabase.from("comments").delete().eq("id", id);
    load();
  };

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">Comments ({comments.length})</h3>

      {currentUserId ? (
        <form onSubmit={submit} className="card p-4 mb-6">
          <textarea
            className="input min-h-[80px]"
            placeholder="Share your thoughts…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <button type="submit" disabled={posting || !text.trim()} className="btn-primary text-sm">
              {posting ? "Posting…" : "Post comment"}
            </button>
          </div>
        </form>
      ) : (
        <p className="card p-4 mb-6 text-sm text-zinc-600">
          <a href="/login" className="text-brand-600 hover:underline">Sign in</a> to leave a comment.
        </p>
      )}

      {loading ? (
        <p className="text-zinc-500 text-sm">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-zinc-500 text-sm">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => {
            const canDelete = isAdmin || c.user_id === currentUserId;
            return (
              <li key={c.id} className="card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{c.user?.name ?? "Unknown"}</span>
                  <span className="text-xs text-zinc-500">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{c.comment_text}</p>
                {canDelete && (
                  <button onClick={() => remove(c.id)} className="mt-2 text-xs text-red-600 hover:underline">
                    Delete
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
