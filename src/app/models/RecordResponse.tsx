import { CommentRecord } from './Record.jsx';

export interface FindCommentsResponse {
  data?: {
    findComments?: {
      data: CommentRecord[];
    }
  }
}