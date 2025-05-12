"use server";

import { cookies } from 'next/headers';

export type ClientOption = {
  value: string;
  label: string;
};

// Server action to set the selected client in a cookie
export async function setSelectedClientCookie(client: ClientOption) {
  (await cookies()).set('selectedClient', JSON.stringify(client), {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secure: process.env.NODE_ENV === 'production',
  });
  
  return { success: true };
}

// Function to get the selected client from cookies (for server components)
export async function getSelectedClientFromCookies(): Promise<ClientOption | null> {
  const cookieStore = await cookies();
  const clientCookie = cookieStore.get('selectedClient');
  
  if (clientCookie) {
    try {
      return JSON.parse(clientCookie.value);
    } catch (e) {
      console.error('Failed to parse selected client cookie:', e);
    }
  }
  
  return null;
}
