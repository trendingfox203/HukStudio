import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { db, isDbConfigured } from "@/lib/db";
import DbNotConfigured from "@/components/admin/DbNotConfigured";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Card from "@/components/admin/Card";
import ActionForm from "@/components/admin/ActionForm";
import ImageUploadField from "@/components/admin/ImageUploadField";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { TextInput, TextArea } from "@/components/admin/FormControls";
import { TrashIcon, PencilIcon } from "@/components/admin/icons";
import { addPost, deletePost } from "./actions";

export const metadata: Metadata = { title: "Quản trị — Blog" };

type PostRow = {
  id: string;
  slug: string;
  title: string;
  cover_url: string | null;
  published_at: string;
};

export default async function AdminBlogPage() {
  if (!isDbConfigured()) return <DbNotConfigured />;

  const { rows: posts } = await db().query<PostRow>(
    `select id, slug, title, cover_url, published_at::text
     from blog_posts order by published_at desc`,
  );

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Blog"
        description="Danh sách bài viết. Bấm vào một bài để soạn nội dung chi tiết (đoạn văn, ảnh, headline)."
      />

      {posts.length === 0 ? (
        <p className="text-sm text-ink/50">Chưa có bài viết nào. Thêm bài đầu tiên ở dưới.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <Card key={post.id} className="flex items-center gap-4">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded">
                {post.cover_url && (
                  <Image src={post.cover_url} alt={post.title} fill className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{post.title}</p>
                <p className="mt-1 text-xs text-ink/50">
                  /blog/{post.slug} · {post.published_at}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/admin/blog/${post.id}`}
                  title="Soạn nội dung"
                  className="rounded p-1.5 text-ink hover:bg-ink/5"
                >
                  <PencilIcon />
                </Link>
                <form action={deletePost.bind(null, post.id)}>
                  <ConfirmSubmitButton
                    message="Xoá bài viết này? Toàn bộ nội dung và ảnh sẽ mất."
                    title="Xoá"
                    className="rounded p-1.5 text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon />
                  </ConfirmSubmitButton>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h3 className="mb-4 text-sm font-medium tracking-wide text-ink/70 uppercase">
          Thêm bài viết mới
        </h3>
        <ActionForm action={addPost} submitLabel="Tạo bài viết" pendingLabel="Đang tạo...">
          <TextInput label="Tiêu đề" name="title" required />
          <TextInput
            label="Slug (URL, để trống sẽ tự tạo từ tiêu đề)"
            name="slug"
            placeholder="vd: a-love-story"
          />
          <TextArea label="Mô tả ngắn (excerpt)" name="excerpt" />
          <TextArea
            label="Đoạn giới thiệu"
            name="introParagraphs"
            hint="Mỗi đoạn cách nhau 1 dòng trống."
          />
          <TextInput label="Ngày đăng" name="publishedAt" type="date" />
          <ImageUploadField name="cover" withAspectRatio label="Ảnh bìa" />
        </ActionForm>
      </Card>
    </div>
  );
}
