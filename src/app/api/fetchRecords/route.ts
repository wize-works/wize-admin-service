import { NextRequest, NextResponse } from "next/server";
import { GetRecords } from "../../service-clients/wize-api-service-client";

// Define interfaces for the nested response structure
interface CommentRecord {
  _id: string;
  userId: string | null;
  postId: string | null;
  name: string | null;
  createdAt: string | null;
  createdBy: string | null;
  comment: string | null;
}

interface FindCommentsResponse {
  data?: {
    findComments?: {
      data: CommentRecord[];
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const db = searchParams.get("db");
  const table = searchParams.get("table");
  const identityId = searchParams.get("identityId");

  if (!db || !table) {
    return NextResponse.json({ error: "Database and table are required." }, { status: 400 });
  }

  try {
    const response = await GetRecords(db, table, null, 'wize_sk_dev_manualtestkey1234567890') as FindCommentsResponse;
    
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
    console.error("Error fetching table data:", error);
    return NextResponse.json({ error: "Failed to fetch table data." }, { status: 500 });
  }
}