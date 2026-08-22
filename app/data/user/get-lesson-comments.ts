import "server-only";

import prisma from "@/lib/prisma";
import { COMMENT_PAGE_SIZE } from "@/lib/constants/comments";
import { type tCommentPage, type tCommentSort } from "@/types/comments";

const DEFAULT_PAGE_SIZE = COMMENT_PAGE_SIZE;

export async function getLessonComments({
  lessonId,
  viewerId,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  sort = "oldest",
}: {
  lessonId: string;
  viewerId: string;
  page?: number;
  pageSize?: number;
  sort?: tCommentSort;
}): Promise<tCommentPage> {
  const where = { lessonId, parentId: null };
  const orderBy =
    sort === "newest"
      ? { createdAt: "desc" as const }
      : { createdAt: "asc" as const };

  const [total, rows] = await Promise.all([
    prisma.lessonComment.count({ where }),
    prisma.lessonComment.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        content: true,
        isEdited: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
        likes: {
          where: { userId: viewerId },
          select: { id: true },
        },
      },
    }),
  ]);

  const items = rows.map((row) => ({
    id: row.id,
    content: row.content,
    isEdited: row.isEdited,
    createdAt: row.createdAt,
    author: {
      id: row.user.id,
      name: row.user.name,
      image: row.user.image,
      role: row.user.role,
    },
    likeCount: row._count.likes,
    likedByMe: row.likes.length > 0,
    replyCount: row._count.replies,
  }));

  return {
    items,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  };
}
