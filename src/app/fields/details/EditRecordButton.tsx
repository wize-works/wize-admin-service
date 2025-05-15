"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface EditRecordButtonProps {
  db: string;
  table: string;
  recordId: string;
  className?: string;
  buttonText?: string;
}

const EditRecordButton: React.FC<EditRecordButtonProps> = ({
  db,
  table,
  recordId,
  className = "btn btn-primary",
  buttonText = "Edit Fields"
}) => {
  const router = useRouter();

  const handleNavigateToEdit = () => {
    router.push(`/fields/edit?db=${db}&table=${table}&recordId=${recordId}`);
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleNavigateToEdit}
    >
      {buttonText}
    </button>
  );
};

export default EditRecordButton;
