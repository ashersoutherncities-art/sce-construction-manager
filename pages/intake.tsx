import { useState, FormEvent } from 'react';
import Layout from '@/components/Layout';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { useRouter } from 'next/router';
import { useRequireAuth } from '@/lib/requireAuth';

export default function IntakePage() {
  const { session, isLoading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    propertyAddress: '',
    propertyType: 'single-family',
    currentCondition: '',
    scopeRequirements: '',
    budgetMin: '',
    budgetMax: '',
    timelineExpectation: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      photos.forEach((photo, idx) => {
        data.append(`photo-${idx}`, photo);
      });

      const response = await fetch('/api/projects/create', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) throw new Error('Failed to create project');

      const result = await response.json();
      alert(`Project created successfully! Project ID: ${result.projectId}`);
      router.push(`/project/${result.projectId}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Project Intake Form">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-sce-gray mb-6">
            Fill out this form to start a new construction project. All fields marked with * are
            required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Information */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-sce-navy mb-4">
                Client Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
                  />
                </div>
              </div>
            </section>

            {/* Property Details */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-sce-navy mb-4">
                Property Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Property Address *
                  </label>
                  <AddressAutocomplete
                    name="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={(value) =>
                      setFormData({ ...formData, propertyAddress: value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Property Type *
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
                  >
                    <option value="single-family">Single Family</option>
                    <option value="multi-family">Multi-Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Current Condition *
                  </label>
                  <textarea
                    name="currentCondition"
                    value={formData.currentCondition}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
                    placeholder="Describe the current state of the property..."
                  />
                </div>
              </div>
            </section>

            {/* Project Scope */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-sce-navy mb-4">
                Project Scope
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Scope Requirements *
                  </label>
                  <textarea
                    name="scopeRequirements"
                    value={formData.scopeRequirements}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
                    placeholder="Describe what work needs to be done..."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Budget Min ($)
                    </label>
                    <input
                      type="number"
                      name="budgetMin"
                      value={formData.budgetMin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Budget Max ($)
                    </label>
                    <input
                      type="number"
                      name="budgetMax"
                      value={formData.budgetMax}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Timeline Expectation
                  </label>
                  <input
                    type="text"
                    name="timelineExpectation"
                    value={formData.timelineExpectation}
                    onChange={handleInputChange}
                    placeholder="e.g., 4-6 weeks"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
                  />
                </div>
              </div>
            </section>

            {/* Photo Upload */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-sce-navy mb-4">
                Property Photos
              </h2>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Upload Photos (optional but recommended)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
                />
                {photos.length > 0 && (
                  <p className="text-sm text-sce-gray mt-2">
                    {photos.length} photo(s) selected
                  </p>
                )}
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-sce-orange text-white px-8 py-3 rounded-full font-semibold hover:bg-sce-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Project...' : 'Submit Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
