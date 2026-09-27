import "server-only";

import prisma from "@/lib/prisma";
import { REPLY_PAGE_SIZE } from "@/lib/constants/comments";
import { normalizePagination } from "@/lib/pagination";
import { type tCommentPage } from "@/types/comments";

const DEFAULT_PAGE_SIZE = REPLY_PAGE_SIZE;
const MAX_PAGE_SIZE = 50;

export async function getLessonReplies({
  commentId,
  viewerId,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: {
  commentId: string;
  viewerId: string;
  page?: number;
  pageSize?: number;
}): Promise<tCommentPage> {
  const where = { parentId: commentId };

  const { page: safePage, pageSize: safePageSize, skip, take } =
    normalizePagination(
      { page, pageSize },
      { defaultPageSize: DEFAULT_PAGE_SIZE, maxPageSize: MAX_PAGE_SIZE },
    );

  const [total, rows] = await Promise.all([
    prisma.lessonComment.count({ where }),
    prisma.lessonComment.findMany({
      where,
      orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }],
      skip,
      take,
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
    replyCount: 0,
  }));

  return {
    items,
    total,
    page: safePage,
    pageSize: safePageSize,
    hasMore: safePage * safePageSize < total,
  };
}
