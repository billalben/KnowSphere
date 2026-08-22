export type tCommentAuthor = {
  id: string;
  name: string;
  image: string | null;
  role: string | null;
};

export type tLessonCommentView = {
  id: string;
  content: string;
  isEdited: boolean;
  createdAt: Date;
  author: tCommentAuthor;
  likeCount: number;
  likedByMe: boolean;
  replyCount: number;
};

export type tCommentPage = {
  items: tLessonCommentView[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type tCommentSort = "oldest" | "newest";
