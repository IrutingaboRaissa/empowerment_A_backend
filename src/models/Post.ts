import { User } from './User';
import { Comment } from './Comment';

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: User;
  category: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  comments?: Comment[];
  
} 



