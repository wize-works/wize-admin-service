"use client";

import { useRouter } from 'next/navigation';
import React from 'react';

interface ErrorPageProps {
  title?: string;
  message?: string;
  errorDetails?: string;
  showDetails?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  title = "An Error Occurred",
  message = "We're sorry, but something went wrong. Please try again later.",
  errorDetails,
  showDetails = false
}) => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="max-w-md w-full p-8 bg-base-200 shadow-lg rounded-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-error mb-4">{title}</h1>
          <div className="divider"></div>
          <p className="text-lg mb-6">{message}</p>
          
          {showDetails && errorDetails && (
            <div className="bg-base-300 p-4 rounded-md mb-6 text-left">
              <details>
                <summary className="cursor-pointer font-semibold">Technical Details</summary>
                <p className="mt-2 text-sm font-mono whitespace-pre-wrap">{errorDetails}</p>
              </details>
            </div>
          )}
          
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
};

export default ErrorPage;
