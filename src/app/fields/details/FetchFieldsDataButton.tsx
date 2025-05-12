"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface FetchFieldsDataButtonProps {
  db: string;
  table: string;
  className?: string;
  buttonText?: string;
}

const FetchFieldsDataButton: React.FC<FetchFieldsDataButtonProps> = ({
  db,
  table,
  className = "px-4 py-2 btn btn-primary",
  buttonText = "Back to Fields"
}) => {
  const router = useRouter();

  const handleNavigateToFields = () => {
    router.push(`/fields?db=${db}&table=${table}`);
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleNavigateToFields}
    >
      {buttonText}
    </button>
  );
};

export default FetchFieldsDataButton;
