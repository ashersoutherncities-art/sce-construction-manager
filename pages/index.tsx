import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Link from 'next/link';
import StatusBadge, { PROJECT_STATUSES, STATUS_CONFIG, normalizeStatus } from '@/components/StatusBadge';

interface Project {
  id: string;
  timestamp: string;
  clientName: string;
  propertyAddress: string;
  status: string;
  budgetMax: number;
}

export default function HomePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects/list');
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const statusMatch = filter === 'all' || normalizeStatus(p.status) === filter;
    const query = searchQuery.toLowerCase();
    const searchMatch =
      !query ||
      p.clientName?.toLowerCase().includes(query) ||
      p.propertyAddress?.toLowerCase().includes(query) ||
      p.id?.toLowerCase().includes(query);
    return statusMatch && searchMatch;
  });

  const stats = {
    total: projects.length,
    intake: projects.filter((p) => normalizeStatus(p.status) === 'intake').length,
    analyzing: projects.filter((p) => normalizeStatus(p.status) === 'analyzing').length,
    underwriting: projects.filter((p) => normalizeStatus(p.status) === 'underwriting').length,
    accepted: projects.filter((p) => normalizeStatus(p.status) === 'accepted').length,
    closed: projects.filter((p) => normalizeStatus(p.status) === 'closed').length,
  };

  // Show loading spinner while checking auth
  if (authStatus === 'loading' || authStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <Layout title="Project Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-3xl font-bold text-sce-navy">{stats.total}</div>
          <div className="text-sce-gray text-sm">Total</div>
        </div>
        {PROJECT_STATUSES.map((status) => {
          const config = STATUS_CONFIG[status];
          return (
            <div
              key={status}
              className="bg-white rounded-lg shadow-lg p-5 cursor-pointer hover:ring-2 hover:ring-sce-orange transition-all"
              onClick={() => setFilter(filter === status ? 'all' : status)}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{config.icon}</span>
                <div className={`text-2xl font-bold ${config.color}`}>{stats[status]}</div>
              </div>
              <div className="text-sce-gray text-sm">{config.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search projects by name, address, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sce-orange focus:border-transparent"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              filter === 'all'
                ? 'bg-sce-navy text-white'
                : 'bg-gray-100 text-sce-gray hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          {PROJECT_STATUSES.map((status) => {
            const config = STATUS_CONFIG[status];
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                  filter === status
                    ? 'bg-sce-orange text-white'
                    : 'bg-gray-100 text-sce-gray hover:bg-gray-200'
                }`}
              >
                <span>{config.icon}</span>
                {config.label} ({stats[status]})
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sce-navy text-white">
              <tr>
                <th className="px-6 py-4 text-left">Project ID</th>
                <th className="px-6 py-4 text-left">Client</th>
                <th className="px-6 py-4 text-left">Property</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Budget</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sce-gray">
                    Loading projects...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sce-gray">
                    {searchQuery ? 'No projects match your search' : 'No projects found'}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm">{project.id}</td>
                    <td className="px-6 py-4">{project.clientName}</td>
                    <td className="px-6 py-4 text-sm">{project.propertyAddress}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4">
                      ${project.budgetMax?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(project.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/project/${project.id}`}
                        className="text-sce-orange hover:underline font-semibold"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
