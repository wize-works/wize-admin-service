import { NextRequest, NextResponse } from "next/server";
import { FetchComments } from "./serviceClient";
import { CommentRecord } from "../../../models/Comment/CommentRecord"; 
import { FindCommentsResponse } from "../../../models/Comment/FindCommentsResponse";

export async function fetchComments(apiKey: string) {
    try {
      const response = await FetchComments(apiKey) as FindCommentsResponse;
  
      // Always ensure we return an array of records
      let tableData: CommentRecord[] = [];
  
      if (response?.data?.findComments?.data) {
        tableData = response.data.findComments.data.map((record) => ({
          _id: record._id,
          userId: record.userId,
          postId: record.postId,
          name: record.name,
          createdAt: record.createdAt,
          createdBy: record.createdBy,
          comment: record.comment
        }));
      }
  
      return NextResponse.json(tableData, { status: 200 });
    } catch (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json({ error: "Failed to fetch comments." }, { status: 500 });
    }
  }