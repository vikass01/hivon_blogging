import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { AddUserForm } from "@/components/AddUserForm";

export default async function AdminPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (!me.isAdmin) redirect("/?err=forbidden");

  const supabase = createClient();
  const [{ data: posts }, { data: comments }, { data: users }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, created_at, author:users!posts_author_id_fkey(name)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("comments")
      .select("id, post_id, comment_text, created_at, user:users!comments_user_id_fkey(name)")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.from("users").select("id, name, email, role").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <header>
        <h1 className="text-3xl font-bold">Admin dashboard</h1>
        <p className="text-zinc-600 text-sm">Monitor all posts, comments, and users.</p>
      </header>

      <section>
        <h2 className="text-lg font-semibold mb-3">Add new user</h2>
        <AddUserForm />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">All posts ({posts?.length ?? 0})</h2>
        <div className="card divide-y divide-zinc-100">
          {(posts ?? []).map((p: any) => (
            <div key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <Link href={`/posts/${p.id}`} className="font-medium hover:text-brand-600">{p.title}</Link>
                <p className="text-xs text-zinc-500">{p.author?.name} · {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <Link href={`/posts/${p.id}/edit`} className="btn-secondary text-sm">Edit</Link>
            </div>
          ))}
          {(posts ?? []).length === 0 && <p className="p-4 text-sm text-zinc-500">No posts.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Recent comments</h2>
        <div className="card divide-y divide-zinc-100">
          {(comments ?? []).map((c: any) => (
            <div key={c.id} className="p-4">
              <p className="text-sm">{c.comment_text}</p>
              <p className="text-xs text-zinc-500 mt-1">
                {c.user?.name} · <Link href={`/posts/${c.post_id}`} className="text-brand-600 hover:underline">View post</Link>
              </p>
            </div>
          ))}
          {(comments ?? []).length === 0 && <p className="p-4 text-sm text-zinc-500">No comments.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Users ({users?.length ?? 0})</h2>
        <div className="card divide-y divide-zinc-100">
          {(users ?? []).map((u: any) => (
            <div key={u.id} className="p-4 flex justify-between items-center text-sm">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-zinc-500">{u.email}</p>
              </div>
              <span className={
                u.role === "admin"
                  ? "px-2 py-0.5 text-xs rounded-full bg-brand-100 text-brand-700 font-medium"
                  : u.role === "author"
                  ? "px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium"
                  : "px-2 py-0.5 text-xs rounded-full bg-zinc-100 text-zinc-600 font-medium"
              }>
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
