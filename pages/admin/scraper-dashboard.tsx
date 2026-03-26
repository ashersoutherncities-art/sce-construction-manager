import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import ScraperPreview from '../../components/ScraperPreview';

interface Contractor {
  id: number;
  name: string;
  businessName?: string;
  services?: string;
  phone?: string;
  email?: string;
  website?: string;
  city?: string;
  state?: string;
  followers?: number;
  facebookUrl?: string;
  sourceDate?: string;
  verified?: boolean;
  notes?: string;
}

interface ScrapeResult {
  success: boolean;
  data?: Partial<Contractor>;
  rawText?: string;
  error?: string;
  url: string;
  duplicates?: Contractor[];
}

interface ScrapeLog {
  id: number;
  url: string;
  status: string;
  errorMessage?: string;
  scrapedAt: string;
}

type Tab = 'scrape' | 'contractors' | 'logs';

export default function ScraperDashboard() {
  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('scrape');

  // Scraper state
  const [urlInput, setUrlInput] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeResults, setScrapeResults] = useState<ScrapeResult[]>([]);
  const [scrapeError, setScrapeError] = useState('');

  // Contractors state
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loadingContractors, setLoadingContractors] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<string>('all');

  // Logs state
  const [logs, setLogs] = useState<ScrapeLog[]>([]);

  // Saving state
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Merge state
  const [mergeTarget, setMergeTarget] = useState<number | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load contractors
  const loadContractors = useCallback(async () => {
    setLoadingContractors(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (filterVerified !== 'all') params.set('verified', filterVerified);
      
      const res = await fetch(`/api/contractors/import?${params}`);
      const data = await res.json();
      setContractors(data.contractors || []);
    } catch (err) {
      console.error('Failed to load contractors:', err);
    } finally {
      setLoadingContractors(false);
    }
  }, [searchTerm, filterVerified]);

  // Load logs
  const loadLogs = async () => {
    try {
      const res = await fetch('/api/contractors/import?action=logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'contractors') loadContractors();
    if (activeTab === 'logs') loadLogs();
  }, [activeTab, loadContractors]);

  // Scrape handler
  const handleScrape = async () => {
    if (!urlInput.trim()) return;

    setScraping(true);
    setScrapeError('');
    setScrapeResults([]);

    try {
      // Support multiple URLs (one per line)
      const urls = urlInput.split('\n').map(u => u.trim()).filter(Boolean);

      if (urls.length === 1) {
        const res = await fetch('/api/scrape/facebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urls[0] }),
        });
        const data = await res.json();
        setScrapeResults([data]);
      } else {
        const res = await fetch('/api/scrape/facebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls }),
        });
        const data = await res.json();
        setScrapeResults(data.results || []);
      }
    } catch (err: any) {
      setScrapeError(err.message || 'Scrape failed');
    } finally {
      setScraping(false);
    }
  };

  // Save contractor
  const handleSave = async (index: number, data: Partial<Contractor>) => {
    setSavingIndex(index);
    try {
      const res = await fetch('/api/contractors/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor: data }),
      });
      const result = await res.json();
      
      if (res.ok) {
        showNotification('success', `Saved: ${data.name}`);
        // Remove from preview
        setScrapeResults(prev => prev.filter((_, i) => i !== index));
      } else {
        showNotification('error', result.error || 'Failed to save');
      }
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setSavingIndex(null);
    }
  };

  // Discard result
  const handleDiscard = (index: number) => {
    setScrapeResults(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle verified
  const handleToggleVerified = async (id: number) => {
    try {
      await fetch('/api/contractors/import', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, toggleVerified: true }),
      });
      loadContractors();
    } catch (err) {
      console.error('Failed to toggle verified:', err);
    }
  };

  // Delete contractor
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this contractor?')) return;
    try {
      await fetch(`/api/contractors/import?id=${id}`, { method: 'DELETE' });
      showNotification('success', 'Contractor deleted');
      loadContractors();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // Merge contractors
  const handleMerge = async (sourceId: number) => {
    if (!mergeTarget) return;
    try {
      await fetch('/api/contractors/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'merge', targetId: mergeTarget, sourceId }),
      });
      showNotification('success', 'Contractors merged');
      setMergeTarget(null);
      loadContractors();
    } catch (err) {
      console.error('Failed to merge:', err);
    }
  };

  // Export CSV
  const handleExport = () => {
    const params = new URLSearchParams();
    params.set('action', 'export');
    if (filterVerified !== 'all') params.set('verified', filterVerified);
    window.open(`/api/contractors/import?${params}`, '_blank');
  };

  const tabs = [
    { id: 'scrape' as Tab, label: '🔍 Scrape Facebook', count: scrapeResults.length },
    { id: 'contractors' as Tab, label: '👷 Contractors', count: contractors.length },
    { id: 'logs' as Tab, label: '📋 Scrape Logs', count: logs.length },
  ];

  return (
    <Layout title="Facebook Scraper Dashboard">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* SCRAPE TAB */}
      {activeTab === 'scrape' && (
        <div>
          {/* URL Input */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Enter Facebook URLs</h2>
            <p className="text-sm text-gray-500 mb-3">
              Paste one or more Facebook page/group/profile URLs (one per line).
              Rate limited to 1 request per 5 seconds.
            </p>
            <textarea
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder={`https://www.facebook.com/ContractorName\nhttps://www.facebook.com/AnotherBusiness`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">
                {urlInput.split('\n').filter(u => u.trim()).length} URL(s)
              </span>
              <button
                onClick={handleScrape}
                disabled={scraping || !urlInput.trim()}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {scraping ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Scraping...
                  </>
                ) : (
                  '🔍 Scrape'
                )}
              </button>
            </div>
          </div>

          {/* Scrape Error */}
          {scrapeError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-700">❌ {scrapeError}</p>
            </div>
          )}

          {/* Scrape Results */}
          {scrapeResults.map((result, idx) => (
            <div key={idx} className="mb-4">
              {result.success && result.data ? (
                <ScraperPreview
                  data={result.data}
                  rawText={result.rawText}
                  duplicates={result.duplicates}
                  onSave={(data) => handleSave(idx, data)}
                  onDiscard={() => handleDiscard(idx)}
                  saving={savingIndex === idx}
                />
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-medium">Failed to scrape: {result.url}</p>
                  <p className="text-red-600 text-sm mt-1">{result.error}</p>
                  {result.rawText && (
                    <details className="mt-2">
                      <summary className="text-sm text-red-500 cursor-pointer">Show raw text</summary>
                      <pre className="text-xs text-gray-500 mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {result.rawText}
                      </pre>
                    </details>
                  )}
                  <button
                    onClick={() => handleDiscard(idx)}
                    className="mt-2 text-sm text-red-600 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}

          {scrapeResults.length === 0 && !scraping && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🔍</p>
              <p>Enter Facebook URLs above and click Scrape to extract contractor data.</p>
            </div>
          )}
        </div>
      )}

      {/* CONTRACTORS TAB */}
      {activeTab === 'contractors' && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadContractors()}
                  placeholder="Name, business, services..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterVerified}
                  onChange={e => setFilterVerified(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
              </div>
              <button
                onClick={loadContractors}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
              >
                🔄 Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                📥 Export CSV
              </button>
            </div>
          </div>

          {/* Merge Mode Banner */}
          {mergeTarget && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 flex items-center justify-between">
              <p className="text-blue-700 text-sm">
                <strong>Merge mode:</strong> Click "Merge into" on another contractor to merge #{mergeTarget} into it.
              </p>
              <button
                onClick={() => setMergeTarget(null)}
                className="text-sm text-blue-600 underline"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Contractor List */}
          {loadingContractors ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : contractors.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">👷</p>
              <p>No contractors found. Scrape some Facebook pages first!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contractors.map(c => (
                <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{c.name}</h3>
                        {c.verified ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">✓ Verified</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Unverified</span>
                        )}
                      </div>
                      {c.businessName && c.businessName !== c.name && (
                        <p className="text-sm text-gray-600">{c.businessName}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                        {c.phone && <span>📞 {c.phone}</span>}
                        {c.email && <span>✉️ {c.email}</span>}
                        {c.city && <span>📍 {c.city}, {c.state}</span>}
                        {c.followers && <span>👥 {c.followers.toLocaleString()} followers</span>}
                      </div>
                      {c.services && (
                        <p className="text-xs text-gray-400 mt-1">🔧 {c.services}</p>
                      )}
                      {c.website && (
                        <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">
                          🌐 {c.website}
                        </a>
                      )}
                      {c.facebookUrl && (
                        <a href={c.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 ml-3 inline-block">
                          📘 Facebook
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 ml-4">
                      <button
                        onClick={() => handleToggleVerified(c.id)}
                        className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        {c.verified ? 'Unverify' : '✓ Verify'}
                      </button>
                      {mergeTarget && mergeTarget !== c.id ? (
                        <button
                          onClick={() => handleMerge(c.id)}
                          className="text-xs px-3 py-1 rounded border border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          Merge into
                        </button>
                      ) : (
                        <button
                          onClick={() => setMergeTarget(c.id)}
                          className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                        >
                          🔗 Merge
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LOGS TAB */}
      {activeTab === 'logs' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Scrape History</h2>
            <button
              onClick={loadLogs}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Refresh
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p>No scrape logs yet.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">URL</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Error</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-blue-600 max-w-xs truncate">
                        <a href={log.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {log.url.replace('https://www.facebook.com/', '')}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          log.status === 'success' ? 'bg-green-100 text-green-700' :
                          log.status === 'not_found' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                        {log.errorMessage || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {log.scrapedAt ? new Date(log.scrapedAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
