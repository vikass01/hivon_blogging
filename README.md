# Hivon Blog — Next.js + Supabase Blogging Platform

A full-stack blogging platform built for the Hivon Automations FullStack Internship Assignment.

## Live demo accounts

All passwords: `demo1234`

| Role    | Email             | Permissions                                                         |
|---------|-------------------|---------------------------------------------------------------------|
| Admin   | admin@demo.com    | View / edit / delete any post, monitor all comments and users      |
| Author  | author@demo.com   | Create posts, edit/delete own posts, view comments                  |
| Viewer  | viewer@demo.com   | View posts, read AI summaries, comment on posts                     |

The login page exposes one-click "Login as …" buttons for each role.

## Tech stack

| Layer          | Technology                                  |
|----------------|---------------------------------------------|
| Framework      | **Next.js 14** (App Router, Server Components) |
| Auth           | **Supabase Auth** (email + password)        |
| Database       | **Supabase Postgres** with Row-Level Security |
| Storage        | Supabase Storage (`post-images` bucket)     |
| AI Summaries   | **Google Gemini** (`gemini-flash-latest`)   |
| Styling        | Tailwind CSS                                |
| Deployment     | Vercel                                      |

## Features

- ✅ Three roles — **Admin / Author / Viewer** — enforced both in the UI and at the database via RLS policies.
- ✅ Posts with **title, featured image, body, AI summary**, and comments.
- ✅ **Search** posts by title or body (server-side ILIKE).
- ✅ **Pagination** (6 posts per page).
- ✅ **Edit / delete** posts (Author for own posts, Admin for any).
- ✅ **Comments** — anyone signed in can comment; owner or Admin can delete.
- ✅ **AI summary generation** on post creation via Google Gemini, stored in the DB to avoid repeated calls.
- ✅ Responsive, modern UI.

## Local setup

```bash
# 1. Install
cd blogging
npm install

# 2. Copy env file (already pre-filled with the project's Supabase + Gemini keys)
cp .env.example .env.local

# 3. Run
npm run dev
# open http://localhost:3000
```

> The Supabase project is already provisioned with all tables, RLS policies, the `post-images` storage bucket, and the three demo users.

## Deployment (Vercel)

1. Push this folder to GitHub.
2. Create a new Vercel project pointing at the repo (root directory: `blogging` if the repo also contains the Lovable parent app).
3. Add these environment variables in Vercel → Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. Deploy. The site is publicly accessible immediately.

## Database schema

```
users        (id ↔ auth.users, name, email)
user_roles   (user_id, role: admin | author | viewer)   -- separate table prevents privilege escalation
posts        (id, title, body, image_url, summary, author_id)
comments     (id, post_id, user_id, comment_text)
```

Role checks use a `SECURITY DEFINER` SQL function `public.has_role(uid, role)` to avoid recursive RLS.

## AI summary flow

1. Author submits a new post via `POST /api/posts`.
2. Server route calls `generateSummary(title, body)` (Google Gemini, ~200-word target, `temperature 0.4`, `maxOutputTokens 400`).
3. Summary is stored in `posts.summary`.
4. Listing page and post page **read** the summary directly — **no further AI calls** ever happen for the same post.
5. On edit, the summary is regenerated **only if the body changed** (cost optimization).

## Cost optimization

- Summary generated **once on creation**, stored in DB.
- On edit, regenerated only when `body` actually changes (title-only edits skip the API call).
- Body trimmed to 8000 chars before sending to the model to cap input tokens.
- `maxOutputTokens: 400` caps the response.

## AI tools used during development

- **Lovable** (lovable.dev) — used to scaffold the Next.js project, write all components and API routes, design the database schema and RLS policies, and seed the demo users. Picked because it pairs an AI coding agent with direct Supabase project control, so schema migrations, RLS, and code all stay in sync without manual context-switching.

## Architecture notes

- **App Router + Server Components** for fast first paint and SEO-friendly post pages.
- **Cookie-based Supabase Auth** via `@supabase/ssr` (works in Server Components, Server Actions, and middleware).
- **Roles in a separate table** (`user_roles`) — never on the profile — so a SQL injection in the profile flow can't escalate privileges.
- **Storage bucket is public**: blog cover images are meant to be public. List-objects API is restricted to authenticated users.

## A bug I hit

Initially the `users` profile rows weren't created on signup, so RLS blocked post inserts (`author_id` had no matching row in `public.users`). Fixed by adding the `handle_new_user` trigger on `auth.users` that inserts the profile and a default `viewer` role row. The trigger also reads `raw_user_meta_data.role` so the seed script can assign `admin` / `author` deterministically.
