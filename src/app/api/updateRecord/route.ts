import { NextRequest, NextResponse } from 'next/server';
import { getSelectedClientFromCookies } from '@/context/clientActions';
import { updateRecord as adminUpdateRecord, FetchApiKey } from '@/app/service-clients/wize-database-service-client';
import { UpdateRecord } from '@/app/service-clients/wize-api-service-client';

export async function POST(request: NextRequest) {
  try {
    // Get user information
    const selectedClient = await getSelectedClientFromCookies();
    if (!selectedClient?.value) {
      return NextResponse.json({ error: 'No client selected' }, { status: 400 });
    }

    const isAdmin = selectedClient.value === '0';
    const formData = await request.formData();
    const db = formData.get('db') as string;
    const table = formData.get('table') as string;
    const recordId = formData.get('recordId') as string;
    
    // Get optional redirect URL from query params - but keep the full original string
    const redirectUrlParam = request.nextUrl.searchParams.get('redirect');
    
    if (!db || !table || !recordId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Extract the record data from the form (excluding db, table, recordId)
    const updatedData: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'db' && key !== 'table' && key !== 'recordId') {
        // Handle conversion of types
        if (value === 'true') {
          updatedData[key] = true;
        } else if (value === 'false') {
          updatedData[key] = false;
        } else if (value === '') {
          updatedData[key] = null;
        } else if (!isNaN(Number(value)) && value !== '') {
          updatedData[key] = Number(value);
        } else if (value && (value as string).startsWith('{') || (value as string).startsWith('[')) {
          try {
            updatedData[key] = JSON.parse(value as string);
          } catch (e) {
            updatedData[key] = value;
          }
        } else {
          updatedData[key] = value;
        }
      }
    }

    // Process the request based on user role
    let result;
    if (isAdmin) {
      // Use direct database access for admin
      result = await adminUpdateRecord(db, table, recordId, updatedData);
    } else {
      // Use API for regular users
      const apiKey = await FetchApiKey(selectedClient.value);
      if (!apiKey) {
        return NextResponse.json({ error: 'API key not found for client' }, { status: 400 });
      }
      result = await UpdateRecord(db, table, recordId, updatedData, apiKey);
    }

    // If we have a successful result
    if (result) {
      // Always redirect to the details page with all parameters explicitly set
      const detailsUrl = `/fields/details?db=${encodeURIComponent(db)}&table=${encodeURIComponent(table)}&recordId=${encodeURIComponent(recordId)}`;
      return NextResponse.redirect(new URL(detailsUrl, request.url));
    }
    
    // If we get here, something went wrong with the record update
  } catch (error) {
    console.error('Error updating record:', error);
    
    // Redirect to error page with the error message
    const errorMessage = encodeURIComponent(error instanceof Error ? error.message : 'Failed to update record');
    return NextResponse.redirect(
      new URL(`/error?message=${errorMessage}`, request.url)
    );
  }
}