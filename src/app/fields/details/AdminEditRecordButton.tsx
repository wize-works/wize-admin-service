"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface AdminEditRecordButtonProps {
  db: string;
  table: string;
  recordId: string;
  className?: string;
  buttonText?: string;
}

const AdminEditRecordButton: React.FC<AdminEditRecordButtonProps> = ({
  db,
  table,
  recordId,
  className = "btn btn-error text-white", // Changed to use DaisyUI's btn-error class
  buttonText = "Admin Edit Fields"
}) => {
  const router = useRouter();

  const handleNavigateToEdit = () => {
    router.push(`/fields/adminEdit?db=${db}&table=${table}&recordId=${recordId}`);
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

export default AdminEditRecordButton;
