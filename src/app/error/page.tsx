'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || 'An error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="max-w-md w-full p-8 bg-base-200 shadow-lg rounded-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-error mb-4">Error</h1>
          <div className="divider"></div>
          <p className="text-lg mb-6">{errorMessage}</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <button 
              onClick={() => router.back()} 
              className="btn btn-outline"
            >
              Go Back
            </button>
            <button 
              onClick={() => router.push('/')} 
              className="btn btn-primary"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
