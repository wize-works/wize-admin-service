import { NextRequest, NextResponse } from "next/server";
import { QueryTable } from "../../service-clients/wize-database-service-client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const db = searchParams.get("db");
  const table = searchParams.get("table");

  if (!db || !table) {
    return NextResponse.json({ error: "Database and table are required." }, { status: 400 });
  }

  try {
    const tableData = await QueryTable(db, table);
    return NextResponse.json(tableData, { status: 200 });
  } catch (error) {
    console.error("Error fetching table data:", error);
    return NextResponse.json({ error: "Failed to fetch table data." }, { status: 500 });
  }
}