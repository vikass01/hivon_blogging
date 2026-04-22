"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AddUserForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"author" | "viewer">("viewer");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setSubmitting(true);

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setErr("Not signed in");
      setSubmitting(false);
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-create-user`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ email, password, name, role }),
    });
    setSubmitting(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error ?? "Failed to create user");
      return;
    }
    setOk(`Created ${data.user.email} as ${data.user.role}`);
    setEmail("");
    setName("");
    setPassword("");
    setRole("viewer");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="card p-5 space-y-4">
      <h3 className="font-semibold">Add a new user</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Optional"
            disabled={submitting}
          />
        </div>
        <div>
          <label className="label">Password (min 8 chars)</label>
          <input
            type="text"
            required
            minLength={8}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <label className="label">Role</label>
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value as "author" | "viewer")}
            disabled={submitting}
          >
            <option value="viewer">Viewer</option>
            <option value="author">Author</option>
          </select>
        </div>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {ok && <p className="text-sm text-green-600">{ok}</p>}

      <div className="flex justify-end">
        <button className="btn-primary" disabled={submitting}>
          {submitting ? "Creating…" : "Create user"}
        </button>
      </div>
    </form>
  );
}
