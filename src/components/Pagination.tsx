"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const params = useSearchParams();
  const linkFor = (p: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(p));
    return `/?${sp.toString()}`;
  };
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1">
      {page > 1 && <Link href={linkFor(page - 1)} className="btn-secondary text-sm">← Prev</Link>}
      {pages.map((p) => (
        <Link
          key={p}
          href={linkFor(p)}
          className={p === page ? "btn-primary text-sm" : "btn-ghost text-sm"}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && <Link href={linkFor(page + 1)} className="btn-secondary text-sm">Next →</Link>}
    </div>
  );
}
