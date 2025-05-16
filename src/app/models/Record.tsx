export interface CommentRecord {
  _id: string;
  // Allow for dynamic properties
  [key: string]: any;
}
