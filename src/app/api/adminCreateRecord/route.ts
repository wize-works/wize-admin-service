import { NextRequest, NextResponse } from 'next/server';
import { createRecord } from '@/app/service-clients/wize-database-service-client';
import { getSelectedClientFromCookies } from '@/context/clientActions';

export async function POST(request: NextRequest) {
  try {
    // Verify admin permissions
    const selectedClient = await getSelectedClientFromCookies();
    if (!selectedClient || selectedClient.value !== '0') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

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
          // Skip empty fields or set to null based on your preference
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

    // Create the record in the database
    const createdRecord = await createRecord(db, table, newRecord);

    // Redirect to the specified URL or return success response
    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    
    return NextResponse.json({ success: true, record: createdRecord }, { status: 201 });
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
