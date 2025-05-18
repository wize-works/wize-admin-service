'use client';
 
import ErrorPage from '@/app/components/ErrorPage';
import { useEffect } from 'react';
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled application error:', error);
  }, [error]);
 
  return (
    <ErrorPage 
      title="Something went wrong!"
      message="An unexpected error has occurred. Please try again later." 
      errorDetails={process.env.NODE_ENV === 'development' ? error.message : undefined}
      showDetails={process.env.NODE_ENV === 'development'}
    />
  );
}
