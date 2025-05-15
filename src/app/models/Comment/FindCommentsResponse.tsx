import { CommentRecord } from './CommentRecord.jsx';

export interface FindCommentsResponse {
  data?: {
    findComments?: {
      data: CommentRecord[];
    }
  }
}