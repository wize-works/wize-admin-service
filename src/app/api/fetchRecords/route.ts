import { NextRequest, NextResponse } from "next/server";
import { fetchComments } from "@/app/service-clients/apiSpecificClients/comment/commentsApi";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const db = searchParams.get("db");
  const table = searchParams.get("table");
  const apiKey = searchParams.get("apiKey");

  if (!db || !table || !apiKey) {
    console.error("Missing required parameters: db, table, or apiKey.");
    return NextResponse.json({ error: "Database, table and apiKey are required." }, { status: 400 });
  }

  try {
    switch (db) {
      case "wize-comment":
        switch (table) {
          case "comments":
            return await fetchComments(apiKey);
          default:
            console.error("Invalid table name:", table);
            return NextResponse.json({ error: "Invalid table name." }, { status: 400 });
        }
      break;
      default:
        console.error("Invalid database name:", db);
        return NextResponse.json({ error: "Invalid database name." }, { status: 400 }); 
    }
  } catch (error) {
    console.error("Error fetching table data:", error);
    return NextResponse.json({ error: "Failed to fetch table data." }, { status: 500 });
  }
}


