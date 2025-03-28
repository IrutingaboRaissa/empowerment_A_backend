export interface Like {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  createdAt: Date;
  updatedAt: Date;
}