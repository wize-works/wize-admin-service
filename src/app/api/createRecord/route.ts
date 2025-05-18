import { NextRequest, NextResponse } from 'next/server';
import { getSelectedClientFromCookies } from '@/context/clientActions';
import { createRecord } from '@/app/service-clients/wize-database-service-client';
import { CreateRecord } from '@/app/service-clients/wize-api-service-client';
import { FetchApiKey } from '@/app/service-clients/wize-database-service-client';

export async function POST(request: NextRequest) {
  try {
    // Get user information
    const selectedClient = await getSelectedClientFromCookies();
    if (!selectedClient?.value) {
      return NextResponse.json({ error: 'No client selected' }, { status: 400 });
    }

    const isAdmin = selectedClient.value === '0';
    
    // Get form data
    const formData = await request.formData();
    const db = formData.get('db') as string;
    const table = formData.get('table') as string;
    
    // Get optional redirect URL from query params
    const redirectUrl = request.nextUrl.searchParams.get('redirect');
    
    if (!db || !table) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Extract the record data from the form (excluding db, table)
    const newRecord: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'db' && key !== 'table') {
        // Handle conversion of types
        if (value === 'true') {
          newRecord[key] = true;
        } else if (value === 'false') {
          newRecord[key] = false;
        } else if (value === '') {
          newRecord[key] = null;
        } else if (!isNaN(Number(value)) && value !== '') {
          newRecord[key] = Number(value);
        } else if (value && (value as string).startsWith('{') || (value as string).startsWith('[')) {
          try {
            newRecord[key] = JSON.parse(value as string);
          } catch (e) {
            newRecord[key] = value;
          }
        } else {
          newRecord[key] = value;
        }
      }
    }

    // Process the request based on user role
    let result;
    if (isAdmin) {
      // Use direct database access for admin
      result = await createRecord(db, table, newRecord);
    } else {
      // Use API for regular users
      const apiKey = await FetchApiKey(selectedClient.value);
      if (!apiKey) {
        return NextResponse.json({ error: 'API key not found for client' }, { status: 400 });
      }
      result = await CreateRecord(db, table, newRecord, apiKey);
    }

    // If we have a successful result and an ID from the created record
    if (result && result._id) {
      // Always redirect to the details page with explicit parameters
      const detailsUrl = `/fields/details?db=${encodeURIComponent(db)}&table=${encodeURIComponent(table)}&recordId=${encodeURIComponent(result._id)}`;
      return NextResponse.redirect(new URL(detailsUrl, request.url));
    } 
    // If we have a successful result but no ID
    else if (result) {
      // Always redirect to the fields page with explicit parameters
      return NextResponse.redirect(
        new URL(`/fields?db=${encodeURIComponent(db)}&table=${encodeURIComponent(table)}`, request.url)
      );
    }
    
    // If we get here, something went wrong with the record creation
    return NextResponse.redirect(
      new URL(`/error?message=${encodeURIComponent("Failed to create record")}`, request.url)
    );
  } catch (error) {
    console.error('Error creating record:', error);
    
    // Redirect to error page with the error message
    const errorMessage = encodeURIComponent(error instanceof Error ? error.message : 'Failed to create record');
    return NextResponse.redirect(
      new URL(`/error?message=${errorMessage}`, request.url)
    );
  }
}
