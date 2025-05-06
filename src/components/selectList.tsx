"use client";

interface SelectListProps {
    options: { value: string; label: string }[];
    selectedValue?: string;
    name: string;
    label: string;
  }
  
  export default function SelectList({ options, selectedValue, name, label }: SelectListProps) {
    return (
      <form method="get" className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium mb-2">
          {label}
        </label>
        <select
          id={name}
          name={name}
          className="p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-black dark:text-white rounded w-full"
          defaultValue={selectedValue || ""}
          onChange={() => {
            // Automatically submit the form when an option is selected
            document.forms[0].submit();
          }}
        >
          <option value="" disabled>
            -- Select an Option --
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </form>
    );
  }