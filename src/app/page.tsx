import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { PostWithAuthor } from "@/lib/types";
import { PostCard } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";

const PAGE_SIZE = 6;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const supabase = createClient();
  const user = await getCurrentUser();
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("posts")
    .select("id, title, body, image_url, summary, author_id, created_at, updated_at, author:users!posts_author_id_fkey(id, name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`);
  }

  const { data, count, error } = await query;
  const posts = (data ?? []) as unknown as PostWithAuthor[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <section className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Stories worth reading.</h1>
        <p className="mt-3 text-zinc-600 max-w-xl mx-auto">
          A clean, modern blogging platform with role-based access and AI-generated summaries.
        </p>
        {user?.isAuthor && (
          <Link href="/posts/new" className="btn-primary mt-6">
            ✏️ Write a new post
          </Link>
        )}
      </section>

      <div className="mb-6">
        <SearchBar initialQuery={q} />
      </div>

      {error && <p className="text-red-600">Failed to load posts: {error.message}</p>}

      {posts.length === 0 ? (
        <div className="card p-10 text-center text-zinc-500">
          {q ? `No posts match "${q}".` : "No posts yet — be the first to publish!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

      <div className="mt-10">
        <Pagination page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
