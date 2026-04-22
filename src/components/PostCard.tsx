import Link from "next/link";
import type { PostWithAuthor } from "@/lib/types";

export function PostCard({ post }: { post: PostWithAuthor }) {
  const date = new Date(post.created_at).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <article className="card overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <Link href={`/posts/${post.id}`} className="block">
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-44 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-44 bg-gradient-to-br from-brand-100 to-brand-50" />
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
          <span>{post.author?.name ?? "Unknown"}</span>
          <span>{date}</span>
        </div>
        <Link href={`/posts/${post.id}`} className="block">
          <h2 className="text-lg font-semibold leading-snug mb-2 hover:text-brand-600">{post.title}</h2>
        </Link>
        <p className="text-sm text-zinc-600 line-clamp-4 flex-1">
          {post.summary ?? post.body.slice(0, 220) + (post.body.length > 220 ? "…" : "")}
        </p>
        <Link href={`/posts/${post.id}`} className="mt-4 text-sm font-medium text-brand-600 hover:underline">
          Read more →
        </Link>
      </div>
    </article>
  );
}
