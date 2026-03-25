import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

interface Vendor {
  id: string;
  name: string;
  trade: string;
  location: string;
  phone: string;
  email: string;
  reliabilityScore: number;
  pricingTier: string;
  performanceNotes: string;
  totalJobs: number;
  successfulJobs: number;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTrade, setSearchTrade] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/vendors/list');
      const data = await response.json();
      if (data.success) {
        setVendors(data.vendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter((v) =>
    searchTrade ? v.trade.toLowerCase().includes(searchTrade.toLowerCase()) : true
  );

  const getSuccessRate = (vendor: Vendor) => {
    if (vendor.totalJobs === 0) return 'N/A';
    return `${Math.round((vendor.successfulJobs / vendor.totalJobs) * 100)}%`;
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Layout title="Vendor Management">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by trade..."
                value={searchTrade}
                onChange={(e) => setSearchTrade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
              />
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-sce-orange text-white px-6 py-2 rounded-full font-semibold hover:bg-sce-navy transition-all"
            >
              {showAddForm ? 'Cancel' : '+ Add Vendor'}
            </button>
          </div>
        </div>

        {/* Add Vendor Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-serif font-bold mb-4">Add New Vendor</h3>
            <VendorForm onSuccess={() => { setShowAddForm(false); fetchVendors(); }} />
          </div>
        )}

        {/* Vendors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-sce-gray">
              Loading vendors...
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="col-span-full text-center py-12 text-sce-gray">
              No vendors found
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-sce-navy">
                      {vendor.name}
                    </h3>
                    <p className="text-sce-orange font-semibold">{vendor.trade}</p>
                  </div>
                  <div className={`text-3xl font-bold ${getReliabilityColor(vendor.reliabilityScore)}`}>
                    {vendor.reliabilityScore.toFixed(1)}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sce-gray">Location:</span>
                    <span className="font-semibold">{vendor.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sce-gray">Success Rate:</span>
                    <span className="font-semibold">{getSuccessRate(vendor)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sce-gray">Pricing:</span>
                    <span className="font-semibold capitalize">{vendor.pricingTier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sce-gray">Total Jobs:</span>
                    <span className="font-semibold">{vendor.totalJobs}</span>
                  </div>
                </div>

                {vendor.performanceNotes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-sce-gray">{vendor.performanceNotes}</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t space-y-1 text-sm">
                  {vendor.phone && (
                    <div className="flex items-center gap-2">
                      <span>📞</span>
                      <a href={`tel:${vendor.phone}`} className="text-sce-orange hover:underline">
                        {vendor.phone}
                      </a>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-2">
                      <span>📧</span>
                      <a href={`mailto:${vendor.email}`} className="text-sce-orange hover:underline">
                        {vendor.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

function VendorForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    trade: '',
    location: 'Charlotte, NC',
    phone: '',
    email: '',
    reliabilityScore: 5,
    pricingTier: 'mid',
    performanceNotes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/vendors/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to add vendor');

      alert('Vendor added successfully!');
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Failed to add vendor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Vendor Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
        />
        <input
          type="text"
          placeholder="Trade (e.g., Plumber) *"
          value={formData.trade}
          onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
          required
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
        />
        <input
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
        />
        <select
          value={formData.pricingTier}
          onChange={(e) => setFormData({ ...formData, pricingTier: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
        >
          <option value="competitive">Competitive</option>
          <option value="mid">Mid-Range</option>
          <option value="premium">Premium</option>
        </select>
      </div>
      <textarea
        placeholder="Performance Notes"
        value={formData.performanceNotes}
        onChange={(e) => setFormData({ ...formData, performanceNotes: e.target.value })}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-sce-orange text-white px-6 py-2 rounded-full font-semibold hover:bg-sce-navy transition-all disabled:opacity-50"
      >
        {submitting ? 'Adding...' : 'Add Vendor'}
      </button>
    </form>
  );
}
