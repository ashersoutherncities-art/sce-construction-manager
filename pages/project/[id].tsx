import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useRequireAuth } from '@/lib/requireAuth';
import type { ScopeOfWork, CostEstimate } from '@/lib/openai';
import { 
  downloadScopeOfWorkPDF, 
  downloadScopeOfWorkExcel,
  downloadCostEstimatePDF,
  downloadCostEstimateExcel 
} from '@/lib/exportUtils';
import StatusDropdown from '@/components/StatusDropdown';
import StatusBadge, { ProjectStatus, STATUS_CONFIG, normalizeStatus } from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';

interface Project {
  id: string;
  timestamp: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  propertyAddress: string;
  propertyType: string;
  currentCondition: string;
  scopeRequirements: string;
  budgetMin: number;
  budgetMax: number;
  timelineExpectation: string;
  photoFolderId: string;
  status: string;
  cachedScopeOfWork?: ScopeOfWork | null;
  cachedCostEstimate?: CostEstimate | null;
  photoCount?: number;
}

export default function ProjectDetailPage() {
  const { session, isLoading: authLoading } = useRequireAuth();
  const router = useRouter();
  const { id } = router.query;
  const { showToast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [scopeOfWork, setScopeOfWork] = useState<ScopeOfWork | null>(null);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [error, setError] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [additionalPhotos, setAdditionalPhotos] = useState<File[]>([]);
  const [projectPhotos, setProjectPhotos] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const handleStatusChange = useCallback(async (newStatus: ProjectStatus) => {
    if (!project) return;
    try {
      const response = await fetch('/api/projects/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update status');
      
      setProject((prev) => prev ? { ...prev, status: newStatus } : prev);
      showToast(`Status updated to ${STATUS_CONFIG[newStatus].label}`, 'success');
    } catch (err) {
      console.error('Status update error:', err);
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
      throw err;
    }
  }, [project, showToast]);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  // Load cached analysis or auto-run if no cache
  useEffect(() => {
    if (project) {
      // Check if we have cached scope (most important part)
      if (project.cachedScopeOfWork) {
        // Use cached results if photo count matches
        if (project.photoCount === projectPhotos.length) {
          console.log('✅ Using cached scope analysis (no photo re-analysis needed)');
          setScopeOfWork(project.cachedScopeOfWork);
          
          // Also load cost estimate if it exists
          if (project.cachedCostEstimate) {
            console.log('✅ Using cached cost estimate');
            setCostEstimate(project.cachedCostEstimate);
          } else {
            console.log('⚠️ No cached cost estimate, will need to generate');
          }
          return;
        } else {
          console.log(`⚠️ Photo count changed: ${project.photoCount} → ${projectPhotos.length}, re-running analysis`);
        }
      } else {
        console.log('⚠️ No cached scope analysis found, will run AI photo analysis');
      }
      
      // No cache or photo count changed - run analysis
      if (project.photoFolderId && !scopeOfWork && !analyzing && projectPhotos.length > 0) {
        console.log('🤖 Running AI photo analysis...');
        handleAnalyzePhotos();
      }
    }
  }, [project, projectPhotos]);

  const fetchProject = async () => {
    try {
      const response = await fetch('/api/projects/list');
      const data = await response.json();
      if (data.success) {
        const foundProject = data.projects.find((p: Project) => p.id === id);
        if (foundProject) {
          setProject(foundProject);
          
          // Fetch project photos if folder exists
          if (foundProject.photoFolderId) {
            fetchProjectPhotos(foundProject.photoFolderId);
          }
        } else {
          setError('Project not found');
        }
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectPhotos = async (folderId: string) => {
    setLoadingPhotos(true);
    try {
      const response = await fetch(`/api/photos/list?folderId=${folderId}`);
      const data = await response.json();
      if (data.success) {
        setProjectPhotos(data.photos);
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleAnalyzePhotos = async () => {
    if (!project?.photoFolderId) {
      setError('No photos available for this project');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const response = await fetch('/api/ai/analyze-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderId: project.photoFolderId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze photos');
      }

      const data = await response.json();
      setScopeOfWork(data.scopeOfWork);
      
      // Save to cache
      if (project?.id) {
        await fetch('/api/projects/save-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            scopeOfWork: data.scopeOfWork,
            costEstimate: null,
            photoCount: projectPhotos.length,
          }),
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze photos');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateEstimate = async () => {
    if (!scopeOfWork) {
      setError('Please analyze photos first');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/ai/estimate-cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scopeOfWork }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate estimate');
      }

      const data = await response.json();
      setCostEstimate(data.costEstimate);
      
      // Update cache with cost estimate
      if (project?.id && scopeOfWork) {
        await fetch('/api/projects/save-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            scopeOfWork,
            costEstimate: data.costEstimate,
            photoCount: projectPhotos.length,
          }),
        });
      }
    } catch (err) {
      console.error('Estimation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate estimate');
    } finally {
      setGenerating(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdditionalPhotos(Array.from(e.target.files));
    }
  };

  const handleAddPhotos = async () => {
    if (additionalPhotos.length === 0) {
      setError('Please select photos to upload');
      return;
    }

    if (!project) {
      setError('Project not found');
      return;
    }

    setUploadingPhotos(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('projectId', project.id);
      formData.append('folderId', project.photoFolderId || '');

      additionalPhotos.forEach((photo, idx) => {
        formData.append(`photo-${idx}`, photo);
      });

      const response = await fetch('/api/projects/update', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload photos');
      }

      const data = await response.json();
      alert(`${data.newPhotoIds.length} photos uploaded successfully!`);
      
      // Clear cache since new photos added
      await fetch('/api/projects/clear-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });
      
      // Clear additional photos and refresh
      setAdditionalPhotos([]);
      setScopeOfWork(null); // Clear old analysis to trigger re-analysis
      setCostEstimate(null);
      await fetchProject(); // Refresh project data
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="text-center py-12">
          <div className="text-sce-gray">Loading project...</div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout title="Project Not Found">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error || 'Project not found'}</div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sce-orange hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Project: ${project.clientName}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-serif font-bold text-sce-navy">
                  {project.clientName}
                </h2>
                {session ? (
                  <StatusDropdown
                    currentStatus={project.status}
                    onStatusChange={handleStatusChange}
                    project={{
                      status: project.status,
                      photoFolderId: project.photoFolderId,
                      cachedScopeOfWork: project.cachedScopeOfWork || scopeOfWork,
                      cachedCostEstimate: project.cachedCostEstimate || costEstimate,
                      photoCount: project.photoCount || projectPhotos.length,
                    }}
                  />
                ) : (
                  <StatusBadge status={project.status} size="md" />
                )}
              </div>
              <p className="text-sce-gray">Project ID: {project.id}</p>
            </div>
            <button onClick={() => router.push('/dashboard')} className="text-sce-orange hover:underline font-semibold">
              ← Dashboard
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-sce-navy mb-2">Client Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-sce-gray">Email:</span> {project.clientEmail}</p>
                <p><span className="text-sce-gray">Phone:</span> {project.clientPhone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sce-navy mb-2">Property Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-sce-gray">Address:</span> {project.propertyAddress}</p>
                <p><span className="text-sce-gray">Type:</span> {project.propertyType}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-sce-navy mb-2">Current Condition</h3>
            <p className="text-sm text-sce-gray">{project.currentCondition}</p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-sce-navy mb-2">Scope Requirements</h3>
            <p className="text-sm text-sce-gray">{project.scopeRequirements}</p>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-sce-navy mb-2">Budget Range</h3>
              <p className="text-sm">${project.budgetMin?.toLocaleString() || '0'} - ${project.budgetMax?.toLocaleString() || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sce-navy mb-2">Timeline</h3>
              <p className="text-sm">{project.timelineExpectation || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sce-navy mb-2">Created</h3>
              <p className="text-sm">{new Date(project.timestamp).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>}

        {/* Photo Gallery + Upload */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-serif font-bold text-sce-navy mb-4">Project Photos</h3>
          
          {loadingPhotos && (
            <div className="mb-6 text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sce-orange mb-4"></div>
              <p className="text-sce-gray">Loading project photos...</p>
            </div>
          )}

          {!loadingPhotos && projectPhotos.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-sce-navy mb-3">Uploaded Photos ({projectPhotos.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {projectPhotos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-sce-orange transition-all">
                    <img src={photo} alt={`Project photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <p className="text-sce-gray text-sm">Add photos to this project for AI analysis. Analysis will run automatically when photos are added.</p>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-2">Upload Additional Photos</label>
                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
                {additionalPhotos.length > 0 && <p className="text-sm text-sce-gray mt-2">{additionalPhotos.length} photo{additionalPhotos.length !== 1 ? 's' : ''} selected</p>}
              </div>
              <button onClick={handleAddPhotos} disabled={uploadingPhotos || additionalPhotos.length === 0} className="bg-sce-navy text-white px-6 py-2 rounded-lg font-semibold hover:bg-sce-orange transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {uploadingPhotos ? 'Uploading...' : 'Add Photos'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-serif font-bold text-sce-navy mb-4">AI Analysis</h3>

          {!scopeOfWork && !analyzing && projectPhotos.length === 0 && (
            <div className="text-center py-6"><p className="text-sce-gray mb-4">Add photos above to enable AI analysis.</p></div>
          )}
          
          {analyzing && (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sce-orange mb-4"></div>
              <p className="text-sce-gray">Analyzing property photos...</p>
            </div>
          )}

          {scopeOfWork && (
            <div className="space-y-6">
              <div className="border-t pt-6">
                <p className="text-sce-gray mb-4">{scopeOfWork.summary}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-sce-navy text-white p-4 rounded-lg">
                    <div className="text-sm opacity-80">Total Estimated Cost</div>
                    <div className="text-2xl font-bold">${scopeOfWork.totalEstimatedCost.toLocaleString()}</div>
                  </div>
                  <div className="bg-sce-orange text-white p-4 rounded-lg">
                    <div className="text-sm opacity-80">Estimated ARV Increase</div>
                    <div className="text-2xl font-bold">${scopeOfWork.estimatedARVIncrease.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-sce-navy mb-4">Recommendations</h4>
                {scopeOfWork.recommendations.map((category, idx) => (
                  <div key={idx} className="mb-4">
                    <h5 className="font-semibold mb-2">{category.category}</h5>
                    <div className="space-y-2">
                      {category.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="text-sm pl-4 border-l-2 border-sce-orange">
                          <div className="font-semibold">{item.task}</div>
                          <div className="text-sce-gray">Cost: ${item.estimatedCost.toLocaleString()} | Priority: {item.priority}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 flex gap-4 flex-wrap">
                <button onClick={handleGenerateEstimate} disabled={generating} className="bg-sce-orange text-white px-8 py-3 rounded-full font-semibold hover:bg-sce-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {generating ? 'Generating Estimate...' : 'Generate Detailed Estimate'}
                </button>
                <button onClick={() => downloadScopeOfWorkPDF(scopeOfWork, project)} className="border-2 border-sce-navy text-sce-navy px-6 py-3 rounded-full font-semibold hover:bg-sce-navy hover:text-white transition-all">
                  📄 Download PDF
                </button>
                <button onClick={() => downloadScopeOfWorkExcel(scopeOfWork, project)} className="border-2 border-green-600 text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-green-600 hover:text-white transition-all">
                  📊 Download Excel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cost Estimate */}
        {costEstimate && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-serif font-bold text-sce-navy mb-4">Detailed Cost Estimate</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sce-navy text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Task</th>
                    <th className="px-4 py-3 text-right">Labor</th>
                    <th className="px-4 py-3 text-right">Materials</th>
                    <th className="px-4 py-3 text-left">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {costEstimate.lineItems.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-3">{item.category}</td>
                      <td className="px-4 py-3">{item.task}</td>
                      <td className="px-4 py-3 text-right">${item.laborCost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">${item.materialCost.toLocaleString()}</td>
                      <td className="px-4 py-3">{item.timeline}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr className="border-t-2">
                    <td colSpan={2} className="px-4 py-3 text-right">Subtotal:</td>
                    <td colSpan={3} className="px-4 py-3">${costEstimate.subtotal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-right">Contingency (10%):</td>
                    <td colSpan={3} className="px-4 py-3">${costEstimate.contingency.toLocaleString()}</td>
                  </tr>
                  <tr className="text-lg">
                    <td colSpan={2} className="px-4 py-3 text-right">Total:</td>
                    <td colSpan={3} className="px-4 py-3">${costEstimate.total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mt-6 flex justify-between items-center flex-wrap gap-4">
              <p className="text-sm text-sce-gray"><strong>Estimated Timeline:</strong> {costEstimate.estimatedTimeline}</p>
              <div className="flex gap-4">
                <button onClick={() => downloadCostEstimatePDF(costEstimate, project)} className="bg-sce-orange text-white px-6 py-3 rounded-full font-semibold hover:bg-sce-navy transition-all">
                  📄 Download PDF
                </button>
                <button onClick={() => downloadCostEstimateExcel(costEstimate, project)} className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-all">
                  📊 Download Excel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
