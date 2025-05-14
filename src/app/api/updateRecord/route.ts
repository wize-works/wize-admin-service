import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { MongoDBConnectionProvider } from '@/app/service-clients/mongodb-connection-provider';

export async function POST(request: NextRequest) {
  try {
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

    // Connect to MongoDB and update the record
    const mongoProvider = MongoDBConnectionProvider.getInstance();
    await mongoProvider.withConnection(async (client) => {
      const database = client.db(db);
      const collection = database.collection(table);
      
      const result = await collection.updateOne(
        { _id: new ObjectId(recordId) },
        { $set: updatedRecord }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('Record not found');
      }
    });

    // Redirect to the details page if a redirect URL was provided
    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    
    // Otherwise return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
