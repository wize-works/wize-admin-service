"use client";

import { useRouter } from "next/navigation";
import SelectList from "../../components/selectList";
import { useEffect, useState } from "react";

interface ClientSideSelectWrapperProps {
  options: { value: string; label: string }[];
  selectedValue?: string;
  databaseName?: string;
}

export default function ClientSideSelectWrapper({
  options,
  selectedValue,
  databaseName
}: ClientSideSelectWrapperProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(selectedValue || "");

  // Handle change and navigation
  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelected(value);
    
    // Navigate to the same page with updated parameters
    if (value && databaseName) {
      router.push(`/tables?db=${encodeURIComponent(databaseName)}&identityId=${encodeURIComponent(value)}`);
    }
  };

  // Custom onChange handler for SelectList
  const customOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSelectionChange(e);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Client Application:</label>
      <select
        value={selected}
        onChange={customOnChange}
        className="w-full p-2 border border-gray-300 rounded-md"
      >
        <option value="">Select Client Application</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
