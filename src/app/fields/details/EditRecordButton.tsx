"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface EditRecordButtonProps {
  db: string;
  table: string;
  recordId: string;
  className?: string;
  buttonText?: string;
  isAdmin?: boolean;
}

const EditRecordButton: React.FC<EditRecordButtonProps> = ({
  db,
  table,
  recordId,
  className,
  buttonText,
  isAdmin
}) => {
  const router = useRouter();

  const computedClassName = className ?? (isAdmin ? "btn btn-error" : "btn btn-primary");
  const computedButtonText = buttonText ?? (isAdmin ? "Admin Edit Fields" : "Edit Fields");

  const handleNavigateToEdit = () => {
    router.push(`/fields/edit?db=${encodeURIComponent(db)}&table=${encodeURIComponent(table)}&recordId=${encodeURIComponent(recordId)}`);
  };

  return (
    <button
      type="button"
      className={computedClassName}
      onClick={handleNavigateToEdit}
    >
      {computedButtonText}
    </button>
  );
};

export default EditRecordButton;
