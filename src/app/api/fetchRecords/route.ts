import { NextRequest, NextResponse } from "next/server";
import { getSelectedClientFromCookies } from "@/context/clientActions";
import { fetchRecords, FetchApiKey } from "@/app/service-clients/wize-database-service-client";
import { FetchRecords, FetchFieldNames } from "../../service-clients/wize-api-service-client";

export async function GET(req: NextRequest) {
  try {
    // Get user information
    const selectedClient = await getSelectedClientFromCookies();
    if (!selectedClient?.value) {
      return NextResponse.json({ error: "No client selected" }, { status: 400 });
    }

    const isAdmin = selectedClient.value === "0";
    
    // Get the query parameters
    const { searchParams } = req.nextUrl;
    const db = searchParams.get("db");
    const table = searchParams.get("table");
    
    if (!db || !table) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Process the request based on user role
    let result;
    if (isAdmin) {
      // Use direct database access for admin
      result = await fetchRecords(db, table, selectedClient.value);
    } else {
      // Use API for regular users
      const apiKey = await FetchApiKey(selectedClient.value);
      if (!apiKey) {
        return NextResponse.json({ error: "API key not found for client" }, { status: 400 });
      }
      
      const fieldInfos = await FetchFieldNames(db, table, apiKey);
      const apiResult = await FetchRecords(db, table, fieldInfos, apiKey);
      result = apiResult;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


