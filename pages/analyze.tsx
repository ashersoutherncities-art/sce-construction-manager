import { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import type { ScopeOfWork, CostEstimate } from '@/lib/openai';

export default function AnalyzePage() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ScopeOfWork | null>(null);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Allow up to 15 photos (will process in batches)
      if (files.length > 15) {
        setError('Please upload a maximum of 15 photos at a time');
        return;
      }
      
      setPhotos(files);

      // Generate previews
      const previewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviews(previewUrls);
      setError('');
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (photos.length === 0) {
      setError('Please upload at least one photo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert photos to base64 for API
      const photoUrls = await Promise.all(
        photos.map(async (photo) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(photo);
          });
        })
      );

      // Process in batches of 3 photos to avoid API limits
      const batchSize = 3;
      const batches: ScopeOfWork[] = [];
      
      for (let i = 0; i < photoUrls.length; i += batchSize) {
        const batch = photoUrls.slice(i, i + batchSize);
        
        const response = await fetch('/api/ai/analyze-photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ photoUrls: batch }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to analyze photos');
        }

        const data = await response.json();
        batches.push(data.scopeOfWork);
      }

      // Merge all batch results
      const mergedResult = mergeScopeOfWork(batches);
      setResult(mergedResult);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze photos');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to merge multiple ScopeOfWork results
  const mergeScopeOfWork = (batches: ScopeOfWork[]): ScopeOfWork => {
    if (batches.length === 1) return batches[0];

    const merged: ScopeOfWork = {
      summary: batches.map(b => b.summary).join(' '),
      recommendations: [],
      totalEstimatedCost: 0,
      estimatedARVIncrease: 0,
    };

    // Merge recommendations by category
    const categoryMap = new Map<string, any>();
    
    batches.forEach(batch => {
      batch.recommendations.forEach(rec => {
        if (categoryMap.has(rec.category)) {
          categoryMap.get(rec.category).items.push(...rec.items);
        } else {
          categoryMap.set(rec.category, { ...rec });
        }
      });
      
      merged.totalEstimatedCost += batch.totalEstimatedCost;
      merged.estimatedARVIncrease += batch.estimatedARVIncrease;
    });

    merged.recommendations = Array.from(categoryMap.values());
    
    return merged;
  };

  const handleGenerateEstimate = async () => {
    if (!result) return;

    setGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/ai/generate-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scopeOfWork: result }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate estimate');
      }

      const data = await response.json();
      setEstimate(data.estimate);
    } catch (err) {
      console.error('Estimate generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate estimate');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToProject = async () => {
    if (!result) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Create a new project with the analysis data
      const formData = new FormData();
      formData.append('clientName', 'Quick Analysis Project');
      formData.append('propertyAddress', 'Analysis from Photo Upload');
      formData.append('propertyType', 'single-family');
      formData.append('scopeRequirements', result.summary);
      formData.append('budgetMin', result.totalEstimatedCost.toString());
      formData.append('budgetMax', (result.totalEstimatedCost * 1.2).toString());
      
      // Add photos
      photos.forEach((photo, idx) => {
        formData.append(`photo-${idx}`, photo);
      });

      const response = await fetch('/api/projects/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      const data = await response.json();
      setSuccess(`Project saved! Redirecting to project...`);
      
      // Redirect to project page after 1 second
      setTimeout(() => {
        window.location.href = `/project/${data.projectId}`;
      }, 1000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!result || !estimate) return;

    // Create PDF content
    const content = `
      SCE Construction Manager - Detailed Estimate
      
      SCOPE OF WORK SUMMARY
      ${result.summary}
      
      COST BREAKDOWN
      ${estimate.lineItems.map(item => 
        `${item.category} - ${item.task}
        Labor: $${item.laborCost.toLocaleString()}
        Materials: $${item.materialCost.toLocaleString()}
        Timeline: ${item.timeline}
        ${item.notes ? 'Notes: ' + item.notes : ''}
        ---`
      ).join('\n')}
      
      SUMMARY
      Subtotal: $${estimate.subtotal.toLocaleString()}
      Contingency (10%): $${estimate.contingency.toLocaleString()}
      Total: $${estimate.total.toLocaleString()}
      
      Estimated Timeline: ${estimate.estimatedTimeline}
      
      Generated: ${new Date().toLocaleDateString()}
    `;

    // Create and download text file (placeholder for PDF)
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estimate-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // TODO: Implement actual PDF generation with jsPDF or similar
    alert('PDF generation coming soon! For now, downloading as text file.');
  };

  const handleReset = () => {
    setPhotos([]);
    setPreviews([]);
    setResult(null);
    setEstimate(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="AI Photo Analysis">
      <div className="max-w-6xl mx-auto">
        {/* Upload Section */}
        {!result && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-serif font-bold text-sce-navy mb-4">
              Upload Property Photos
            </h2>
            <p className="text-sce-gray mb-6">
              Upload photos of the property and our AI will analyze them to generate a detailed
              scope of work with cost estimates and ARV impact.
              <br />
              <span className="text-sm">Upload up to 15 photos. Photos will be processed in batches for best results.</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Select Photos</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
              />
              {photos.length > 0 && (
                <p className="text-sm text-sce-gray mt-2">{photos.length} photo(s) selected</p>
              )}
            </div>

            {/* Photo Previews */}
            {previews.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Preview</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previews.map((preview, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                {success}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleAnalyze}
                disabled={loading || photos.length === 0}
                className="bg-sce-orange text-white px-8 py-3 rounded-full font-semibold hover:bg-sce-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Analyze Photos'}
              </button>
              {photos.length > 0 && (
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="border-2 border-sce-gray text-sce-gray px-8 py-3 rounded-full font-semibold hover:border-sce-navy hover:text-sce-navy transition-all disabled:opacity-50"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-sce-navy mb-2">
                    Analysis Complete
                  </h2>
                  <p className="text-sce-gray">{result.summary}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-sce-orange hover:underline font-semibold"
                >
                  ← New Analysis
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-sce-navy text-white p-6 rounded-lg">
                  <div className="text-sm opacity-80 mb-2">Total Estimated Cost</div>
                  <div className="text-3xl font-bold">
                    ${result.totalEstimatedCost.toLocaleString()}
                  </div>
                </div>
                <div className="bg-sce-orange text-white p-6 rounded-lg">
                  <div className="text-sm opacity-80 mb-2">Estimated ARV Increase</div>
                  <div className="text-3xl font-bold">
                    ${result.estimatedARVIncrease.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations by Category */}
            {result.recommendations.map((category, catIdx) => (
              <div key={catIdx} className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-xl font-serif font-bold text-sce-navy mb-4">
                  {category.category}
                </h3>
                <div className="space-y-4">
                  {category.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sce-navy">{item.task}</h4>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                            item.priority
                          )}`}
                        >
                          {item.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-sce-gray">Estimated Cost:</span>
                          <span className="ml-2 font-semibold">
                            ${item.estimatedCost.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-sce-gray">ARV Impact:</span>
                          <span className="ml-2 font-semibold">{item.arvImpact}</span>
                        </div>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-sce-gray border-t pt-3">{item.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-serif font-bold text-sce-navy mb-4">Next Steps</h3>
              <div className="flex gap-4">
                <button
                  onClick={handleGenerateEstimate}
                  disabled={generating || !!estimate}
                  className="bg-sce-orange text-white px-8 py-3 rounded-full font-semibold hover:bg-sce-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? 'Generating...' : estimate ? 'Estimate Generated ✓' : 'Generate Detailed Estimate'}
                </button>
                <button
                  onClick={handleSaveToProject}
                  disabled={saving}
                  className="border-2 border-sce-navy text-sce-navy px-8 py-3 rounded-full font-semibold hover:bg-sce-navy hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save to Project'}
                </button>
              </div>
            </div>

            {/* Detailed Estimate Display */}
            {estimate && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-xl font-serif font-bold text-sce-navy mb-6">Detailed Cost Estimate</h3>
                
                <div className="overflow-x-auto mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-sce-navy">
                        <th className="text-left py-3 px-4">Category & Task</th>
                        <th className="text-right py-3 px-4">Labor</th>
                        <th className="text-right py-3 px-4">Materials</th>
                        <th className="text-right py-3 px-4">Timeline</th>
                        <th className="text-right py-3 px-4">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estimate.lineItems.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-sce-navy">{item.category}</div>
                            <div className="text-sm text-gray-600">{item.task}</div>
                            {item.notes && (
                              <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                            )}
                          </td>
                          <td className="text-right py-3 px-4">${item.laborCost.toLocaleString()}</td>
                          <td className="text-right py-3 px-4">${item.materialCost.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-sm">{item.timeline}</td>
                          <td className="text-right py-3 px-4 font-semibold">
                            ${(item.laborCost + item.materialCost).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 font-semibold">
                        <td colSpan={4} className="text-right py-3 px-4">Subtotal</td>
                        <td className="text-right py-3 px-4">${estimate.subtotal.toLocaleString()}</td>
                      </tr>
                      <tr className="text-sce-orange">
                        <td colSpan={4} className="text-right py-3 px-4">Contingency (10%)</td>
                        <td className="text-right py-3 px-4">${estimate.contingency.toLocaleString()}</td>
                      </tr>
                      <tr className="border-t-2 border-sce-navy text-xl font-bold text-sce-navy">
                        <td colSpan={4} className="text-right py-3 px-4">Total</td>
                        <td className="text-right py-3 px-4">${estimate.total.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="bg-sce-light-bg p-4 rounded-lg mb-6">
                  <div className="font-semibold text-sce-navy mb-2">Estimated Timeline</div>
                  <div className="text-lg">{estimate.estimatedTimeline}</div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleDownloadPDF}
                    className="bg-sce-navy text-white px-8 py-3 rounded-full font-semibold hover:bg-sce-orange transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
