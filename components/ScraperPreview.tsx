import React, { useState } from 'react';

interface ContractorData {
  name?: string;
  businessName?: string;
  services?: string;
  phone?: string;
  email?: string;
  website?: string;
  city?: string;
  state?: string;
  followers?: number;
  facebookUrl?: string;
  notes?: string;
}

interface Duplicate {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  facebookUrl?: string;
}

interface ScraperPreviewProps {
  data: ContractorData;
  rawText?: string;
  duplicates?: Duplicate[];
  onSave: (data: ContractorData) => void;
  onDiscard: () => void;
  saving?: boolean;
}

export default function ScraperPreview({ data, rawText, duplicates, onSave, onDiscard, saving }: ScraperPreviewProps) {
  const [editData, setEditData] = useState<ContractorData>(data);
  const [showRaw, setShowRaw] = useState(false);

  const updateField = (field: keyof ContractorData, value: string | number) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const fields: { key: keyof ContractorData; label: string; type?: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'businessName', label: 'Business Name' },
    { key: 'services', label: 'Services' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'website', label: 'Website', type: 'url' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'followers', label: 'Followers', type: 'number' },
    { key: 'facebookUrl', label: 'Facebook URL', type: 'url' },
    { key: 'notes', label: 'Notes' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Extracted Data Preview</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {showRaw ? 'Hide Raw Text' : 'Show Raw Text'}
          </button>
        </div>
      </div>

      {/* Duplicate Warning */}
      {duplicates && duplicates.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <p className="text-yellow-800 font-medium">⚠️ Possible duplicates found:</p>
          <ul className="mt-1 text-sm text-yellow-700">
            {duplicates.map(d => (
              <li key={d.id}>
                <strong>{d.name}</strong>
                {d.phone && ` • ${d.phone}`}
                {d.email && ` • ${d.email}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Editable Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {fields.map(({ key, label, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {key === 'notes' || key === 'services' ? (
              <textarea
                value={(editData[key] as string) || ''}
                onChange={e => updateField(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            ) : (
              <input
                type={type || 'text'}
                value={(editData[key] as string | number) || ''}
                onChange={e => updateField(key, type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        ))}
      </div>

      {/* Raw Text Preview */}
      {showRaw && rawText && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Raw Extracted Text</label>
          <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 text-xs text-gray-600 max-h-60 overflow-y-auto whitespace-pre-wrap">
            {rawText}
          </pre>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onDiscard}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Discard
        </button>
        <button
          onClick={() => onSave(editData)}
          disabled={saving || !editData.name}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : duplicates && duplicates.length > 0 ? 'Save Anyway' : 'Save Contractor'}
        </button>
      </div>
    </div>
  );
}
