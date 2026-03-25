import { useState } from 'react';
import Layout from '@/components/Layout';

export default function PlansAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [planFiles, setPlanFiles] = useState<File[]>([]);
  const [projectType, setProjectType] = useState('addition');
  const [estimate, setEstimate] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPlanFiles(Array.from(e.target.files));
    }
  };

  const handleAnalyzePlans = async () => {
    if (planFiles.length === 0) {
      setError('Please upload at least one plan/blueprint');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      // Convert images to base64 for AI analysis
      const imagePromises = planFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      const imageDataUrls = await Promise.all(imagePromises);

      const response = await fetch('/api/ai/analyze-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plans: imageDataUrls,
          projectType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze plans');
      }

      const data = await response.json();
      setEstimate(data.estimate);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze plans');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-serif font-bold text-sce-navy mb-8">
          Architectural Plan Analysis
        </h1>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-serif font-bold text-sce-navy mb-4">
            Upload Plans/Blueprints
          </h2>

          <div className="space-y-6">
            {/* Project Type */}
            <div>
              <label className="block text-sm font-semibold mb-2">Project Type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
              >
                <option value="addition">Addition</option>
                <option value="new-construction">New Construction</option>
                <option value="renovation">Major Renovation</option>
                <option value="remodel">Remodel</option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Upload Architectural Plans (PDF, PNG, JPG)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
              />
              {planFiles.length > 0 && (
                <p className="text-sm text-sce-gray mt-2">
                  {planFiles.length} file{planFiles.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyzePlans}
              disabled={analyzing || planFiles.length === 0}
              className="w-full bg-sce-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-sce-orange transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? 'Analyzing Plans...' : 'Generate Cost Estimate'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Analysis Progress */}
        {analyzing && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sce-orange mb-4"></div>
              <p className="text-sce-gray">AI analyzing architectural plans...</p>
              <p className="text-sm text-sce-gray mt-2">This may take 30-60 seconds</p>
            </div>
          </div>
        )}

        {/* Estimate Results */}
        {estimate && !analyzing && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-serif font-bold text-sce-navy mb-6">
              Cost Estimate
            </h2>

            {/* Summary */}
            <div className="bg-sce-light p-6 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-sce-gray">Estimated Square Footage</p>
                  <p className="text-2xl font-bold text-sce-navy">{estimate.squareFeet} sq ft</p>
                </div>
                <div>
                  <p className="text-sm text-sce-gray">Total Estimated Cost</p>
                  <p className="text-2xl font-bold text-sce-orange">
                    ${estimate.totalCost.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-sce-navy">Cost Breakdown</h3>
              {estimate.breakdown?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sce-gray">{item.category}</span>
                  <span className="font-semibold text-sce-navy">
                    ${item.cost.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Notes */}
            {estimate.notes && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800 mb-2">Important Notes:</p>
                <p className="text-sm text-yellow-700">{estimate.notes}</p>
              </div>
            )}

            {/* Download Button */}
            <div className="mt-8">
              <button
                onClick={() => {
                  // Generate PDF download
                  alert('PDF export coming soon!');
                }}
                className="bg-sce-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-sce-navy transition-all"
              >
                Download Estimate PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
