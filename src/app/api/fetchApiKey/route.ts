import { NextRequest, NextResponse } from 'next/server';
import { FetchApiKey } from '../../service-clients/wize-database-service-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('clientId');
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }
    
    const apiKey = await FetchApiKey(clientId);
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Identity key not found' }, { status: 404 });
    }
    
    return NextResponse.json({ apiKey: apiKey });
  } catch (error) {
    console.error('Error fetching identity key:', error);
    return NextResponse.json({ error: 'Failed to fetch identity key' }, { status: 500 });
  }
}
