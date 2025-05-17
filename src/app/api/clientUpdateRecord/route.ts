import { NextRequest, NextResponse } from 'next/server';
import { UpdateRecord } from '@/app/service-clients/wize-api-service-client';
import { getSelectedClientFromCookies } from '@/context/clientActions';
import { FetchApiKey } from '@/app/service-clients/wize-database-service-client';

export async function POST(request: NextRequest) {
  try {
    // Get the selected client from cookies
    const selectedClient = await getSelectedClientFromCookies();
    if (!selectedClient?.value) {
      return NextResponse.json({ error: 'No client selected' }, { status: 400 });
    }
    
    // Get form data
    const formData = await request.formData();
    const db = formData.get('db') as string;
    const table = formData.get('table') as string;
    const recordId = formData.get('recordId') as string;
    
    // Get optional redirect URL from query params
    const redirectUrl = request.nextUrl.searchParams.get('redirect');
    
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

    // Get API key for the client
    const apiKey = await FetchApiKey(selectedClient.value);
    if (!apiKey && selectedClient.value !== '0') {
      return NextResponse.json({ error: 'API key not found for client' }, { status: 400 });
    }

    // Update the record using the API service
    const result = await UpdateRecord(db, table, recordId, updatedData, apiKey || undefined);
    
    // Redirect to the specified URL or return success response
    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    
    return NextResponse.json({ 
      success: true,
      record: result
    });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
