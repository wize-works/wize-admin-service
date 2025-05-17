import { NextRequest, NextResponse } from "next/server";
import { FetchRecords, FetchFieldNames } from "../../service-clients/wize-api-service-client";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const db = searchParams.get("db");
  const table = searchParams.get("table");
  const apiKey = searchParams.get("apiKey");
  const identityKey = searchParams.get("identityKey");

  if (!db || !table || !apiKey || !identityKey) {
    console.error("Missing required parameters: db, table, apiKey, or identityKey.");
    return NextResponse.json({ error: "Database, table, apiKey and identityKey are required." }, { status: 400 });
  }

  try {
    const fieldInfos = await FetchFieldNames(db, table, apiKey);
    const fieldNames = fieldInfos.map(fieldInfo => fieldInfo.name);
    
    // Get the records data
    const recordsData: { data?: { [key: string]: any } } | { [key: string]: any }[] = await FetchRecords(db, table, fieldNames, apiKey);
    
    // Return the raw data if it doesn't have the expected structure
    return NextResponse.json(recordsData || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching table data:", error);
    return NextResponse.json({ error: "Failed to fetch table data." }, { status: 500 });
  }
}


