"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface FetchFieldsDataButtonProps {
  db: string;
  table: string;
  identityId: string;
  className?: string;
  buttonText?: string;
}

const FetchFieldsDataButton: React.FC<FetchFieldsDataButtonProps> = ({
  db,
  table,
  identityId,
  className = "button btn bg-base-100 hover:bg-base-300",
  buttonText = "Back to Fields"
}) => {
  const router = useRouter();

  const handleNavigateToFields = () => {
    router.push(`/fields?db=${db}&table=${table}&identityId=${identityId}`);
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
