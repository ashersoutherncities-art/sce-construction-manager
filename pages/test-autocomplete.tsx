import { useState } from 'react';
import AddressAutocomplete from '@/components/AddressAutocomplete';

/**
 * Test page for Google Places Autocomplete
 * Visit: http://localhost:3001/test-autocomplete
 * 
 * Try typing: "123 Main St, Charlotte, NC"
 */
export default function TestAutocompletePage() {
  const [address, setAddress] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    if (value !== selectedAddress) {
      setSelectedAddress(null);
    }
  };

  const handleManualSubmit = () => {
    setSelectedAddress(address);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🗺️ Address Autocomplete Test
          </h1>
          <p className="text-gray-600 mb-8">
            Test the Google Places Autocomplete integration
          </p>

          {/* API Key Status */}
          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start">
              <span className="text-2xl mr-3">ℹ️</span>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Setup Status</h3>
                <p className="text-sm text-blue-700">
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                    ? '✅ API key configured - autocomplete should work'
                    : '⚠️ No API key found - see GOOGLE_MAPS_SETUP.md'}
                </p>
              </div>
            </div>
          </div>

          {/* Test Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Address
              </label>
              <AddressAutocomplete
                name="testAddress"
                value={address}
                onChange={handleAddressChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 Try typing: <code className="bg-gray-100 px-2 py-1 rounded">123 Main St, Charlotte, NC</code>
              </p>
            </div>

            <button
              onClick={handleManualSubmit}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Test Submit
            </button>
          </div>

          {/* Results Display */}
          {selectedAddress && (
            <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">✅ Address Captured</h3>
              <p className="text-green-700 font-mono text-sm break-all">
                {selectedAddress}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">How to Test</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Start typing an address in the field above</li>
              <li>You should see a dropdown with suggestions appear</li>
              <li>Click on a suggestion to auto-fill the complete address</li>
              <li>The address should appear formatted below when you click Submit</li>
            </ol>
          </div>

          {/* Troubleshooting */}
          <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-2">Not Working?</h3>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Check browser console for errors (F12 → Console)</li>
              <li>Ensure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set in .env</li>
              <li>Restart dev server after adding API key</li>
              <li>See GOOGLE_MAPS_SETUP.md for full setup instructions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
