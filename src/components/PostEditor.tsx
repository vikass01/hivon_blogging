"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props =
  | { mode: "create"; post?: undefined }
  | { mode: "edit"; post: { id: string; title: string; body: string; image_url: string | null; author_id: string } };

export function PostEditor(props: Props) {
  const router = useRouter();
  const initial = props.mode === "edit" ? props.post : null;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErr("Not signed in");
      setUploading(false);
      return;
    }
    const path = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("post-images").upload(path, file, { upsert: false });
    if (upErr) {
      setErr(upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);

    const endpoint = props.mode === "create" ? "/api/posts" : `/api/posts/${initial!.id}`;
    const method = props.mode === "create" ? "POST" : "PATCH";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, image_url: imageUrl.trim() || null }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }
    const data = await res.json();
    router.push(`/posts/${data.id ?? initial!.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 card p-6 relative">
      {submitting && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10">
          <div className="h-10 w-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
          <p className="mt-3 text-sm text-zinc-700 font-medium">
            {props.mode === "create" ? "Publishing & generating AI summary…" : "Saving changes…"}
          </p>
        </div>
      )}

      <div>
        <label className="label">Title</label>
        <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} disabled={submitting} />
      </div>

      <div>
        <label className="label">Featured image</label>
        <div className="space-y-2">
          <input
            type="url"
            className="input"
            placeholder="Paste an image URL (https://…)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={submitting || uploading}
          />
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">or upload a file:</span>
            <input type="file" accept="image/*" onChange={onUpload} className="text-sm" disabled={submitting} />
            {uploading && <span className="text-sm text-zinc-500">Uploading…</span>}
          </div>
        </div>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="mt-3 h-32 rounded-lg object-cover border border-zinc-200"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.display = ""; }}
          />
        )}
      </div>

      <div>
        <label className="label">Body</label>
        <textarea
          className="input min-h-[260px]"
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your post here…"
          disabled={submitting}
        />
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="flex gap-2 justify-end">
        <button type="button" className="btn-ghost" onClick={() => router.back()} disabled={submitting}>Cancel</button>
        <button type="submit" disabled={submitting || uploading} className="btn-primary">
          {submitting ? "Saving…" : props.mode === "create" ? "Publish post" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
