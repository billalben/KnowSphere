export type tCourseReviewView = {
  id: string;
  rating: number;
  comment: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    image: string | null;
    role: string | null;
  };
};

export type tCourseRatingAggregate = {
  avg: number;
  count: number;
};
