"use client";

import React, { useEffect, useState } from "react";

interface SelectListProps {
  options: { value: string; label: string }[];
  selectedValue?: string;
  onChange?: (value: string) => void;
  name: string;
  label: string;
}

const SelectList: React.FC<SelectListProps> = ({
  options,
  selectedValue,
  onChange,
  name,
  label,
}) => {
  const [value, setValue] = useState(selectedValue || "");

  // Update internal state when the prop changes
  useEffect(() => {
    if (selectedValue !== undefined) {
      setValue(selectedValue);
    }
  }, [selectedValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <select
        className="select select-bordered w-full max-w-xs"
        name={name}
        value={value}
        onChange={handleChange}
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectList;