"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      className="btn-danger text-sm"
      disabled={loading}
      onClick={async () => {
        if (!confirm("Delete this post permanently?")) return;
        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.from("posts").delete().eq("id", postId);
        setLoading(false);
        if (error) {
          alert(error.message);
          return;
        }
        router.push("/");
        router.refresh();
      }}
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
