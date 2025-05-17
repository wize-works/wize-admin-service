import React from 'react';

interface RecordTableProps {
  record: Record<string, any>;
}

const RecordTable: React.FC<RecordTableProps> = ({ record }) => {
  if (!record || Object.keys(record).length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg text-gray-500">No record found</p>
      </div>
    );
  }

  return (
    <table className="table-auto border-collapse w-full">
      <thead className="bg-base-300">
        <tr>
          <th className="px-4 py-2 text-left border border-base-300">Field</th>
          <th className="px-4 py-2 text-left border border-base-300">Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(record).map(([field, value]) => (
          <tr key={field}>
            <td className="px-4 py-2 border border-base-200 font-medium w-1/3">{field}</td>
            <td className="px-4 py-2 border border-base-200">
              {value === null ? (
                <span className="text-gray-400">null</span>
              ) : typeof value === 'object' ? (
                <pre className="whitespace-pre-wrap overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
              ) : (
                String(value)
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RecordTable;
