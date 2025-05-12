"use client"

import { useRouter } from 'next/navigation';

export default function NavigateBackButton({ className = "btn btn-outline" }) {
  const router = useRouter();
  
  return (
    <button 
      type="button" 
      onClick={() => router.back()}
      className={className}
    >
      Cancel
    </button>
  );
}
