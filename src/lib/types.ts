export type Role = "admin" | "author" | "viewer";

export type DbUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
};

export type Post = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  summary: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
};

export type PostWithAuthor = Post & {
  author: Pick<DbUser, "id" | "name"> | null;
};
