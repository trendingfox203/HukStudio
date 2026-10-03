import { db, isDbConfigured } from "@/lib/db";

export type BlogComment = { id: string; authorName: string; body: string; createdAt: string };

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getPostEngagement(
  postId: string,
): Promise<{ enabled: boolean; likeCount: number; comments: BlogComment[] }> {
  if (!isDbConfigured() || !UUID_RE.test(postId)) return { enabled: false, likeCount: 0, comments: [] };

  try {
    const client = db();
    const [{ rows: posts }, { rows: comments }] = await Promise.all([
      client.query("select like_count from blog_posts where id = $1", [postId]),
      client.query(
        `select id, author_name, body, created_at::text from blog_comments
         where post_id = $1 order by created_at desc limit 200`,
        [postId],
      ),
    ]);
    if (posts.length === 0) return { enabled: false, likeCount: 0, comments: [] };
    return {
      enabled: true,
      likeCount: posts[0].like_count as number,
      comments: comments.map((row) => ({
        id: row.id,
        authorName: row.author_name,
        body: row.body,
        createdAt: row.created_at,
      })),
    };
  } catch {
    return { enabled: false, likeCount: 0, comments: [] };
  }
}
