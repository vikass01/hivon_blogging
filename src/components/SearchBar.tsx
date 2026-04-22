"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initialQuery);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const sp = new URLSearchParams(params.toString());
        if (q.trim()) sp.set("q", q.trim());
        else sp.delete("q");
        sp.delete("page");
        router.push(`/?${sp.toString()}`);
      }}
      className="flex gap-2"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search posts by title or content…"
        className="input"
      />
      <button type="submit" className="btn-primary">Search</button>
      {initialQuery && (
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setQ("");
            router.push("/");
          }}
        >
          Clear
        </button>
      )}
    </form>
  );
}
