import { User } from './User';
import { Like } from './Like';

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author?: User;
  postId: string;
  likes: Like[];
  createdAt: Date;
  updatedAt: Date;
} 