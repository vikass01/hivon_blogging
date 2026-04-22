import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PostEditor } from "@/components/PostEditor";

export default async function NewPostPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (!me.isAuthor) redirect("/?err=forbidden");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Write a new post</h1>
      <PostEditor mode="create" />
    </div>
  );
}
