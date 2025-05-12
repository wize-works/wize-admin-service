import { NextResponse } from 'next/server';
import { FetchClientKeys } from '@/app/service-clients/wize-database-service-client';

export async function GET() {
  try {
    const clientKeys = await FetchClientKeys();
    return NextResponse.json(clientKeys);
  } catch (error) {
    console.error('Error fetching client keys:', error);
    return NextResponse.json({ error: 'Failed to fetch client keys' }, { status: 500 });
  }
}
