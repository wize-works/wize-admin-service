"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RecordData {
  _id: string;
  [key: string]: any;
}

export default function EditRecordPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string },
  searchParams: { db: string, table: string, identityId: string; recordId: string }
}) {
  const { id: recordid } = params;
  const { db, table, identityId } = searchParams;
  
  const router = useRouter();
  const [record, setRecord] = useState<RecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<{[key: string]: any}>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch the record data
  useEffect(() => {
    async function fetchRecord() {
      try {
        const response = await fetch(`/api/record/${recordid}?db=${db}&table=${table}&identityId=${identityId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setRecord(data);
        setFormValues(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch record');
      } finally {
        setLoading(false);
      }
    }

    fetchRecord();
  }, [recordid, db, table, identityId]);

  // Handle input change
  const handleChange = (key: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/record?db=${db}&table=${table}&recordId=${recordid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Navigate back to the table view after successful save
      router.push(`/fields?db=${db}&table=${table}&recordId=${identityId}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-5">Loading record data...</div>;
  }

  if (error) {
    return <div className="p-5 text-red-500">Error: {error}</div>;
  }

  if (!record) {
    return <div className="p-5">Record not found</div>;
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Edit Record</h1>
      <div className="mb-4">
        <span className="font-bold">Database:</span> {db}<br />
        <span className="font-bold">Table:</span> {table}<br />
        <span className="font-bold">ID:</span> {recordid}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(record).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label className="font-bold mb-1">{key}</label>
            {key === '_id' ? (
              // ID field is read-only
              <input 
                type="text" 
                value={value as string} 
                disabled 
                className="p-2 border rounded bg-gray-100"
              />
            ) : (
              // All other fields are editable
              <input
                type="text"
                value={formValues[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="p-2 border rounded"
              />
            )}
          </div>
        ))}
        
        {saveError && <div className="text-red-500">{saveError}</div>}
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="button bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <Link
            href={`/fields?db=${db}&table=${table}&option=${identityId}`}
            className="py-2 px-4 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
