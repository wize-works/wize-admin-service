import { NextRequest, NextResponse } from 'next/server';
import { updateRecord } from '@/app/service-clients/wize-database-service-client';
import { getSelectedClientFromCookies } from '@/context/clientActions';

export async function POST(request: NextRequest) {
  try {
    // Verify admin permissions
    const selectedClient = await getSelectedClientFromCookies();
    if (!selectedClient || selectedClient.value !== '0') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
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
    const updatedRecord: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'db' && key !== 'table' && key !== 'recordId') {
        // Handle conversion of types
        if (value === 'true') {
          updatedRecord[key] = true;
        } else if (value === 'false') {
          updatedRecord[key] = false;
        } else if (!isNaN(Number(value)) && value !== '') {
          updatedRecord[key] = Number(value);
        } else if (value && (value as string).startsWith('{') || (value as string).startsWith('[')) {
          try {
            updatedRecord[key] = JSON.parse(value as string);
          } catch (e) {
            updatedRecord[key] = value;
          }
        } else {
          updatedRecord[key] = value;
        }
      }
    }

    // Use our updateRecord function to update the record
    const result = await updateRecord(db, table, recordId, updatedRecord);
    
    if (!result) {
      throw new Error('Record not found or update failed');
    }

    // Redirect to the details page if a redirect URL was provided
    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    
    // Otherwise return success response with the updated record
    return NextResponse.json({ 
      success: true,
      record: result
    });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
