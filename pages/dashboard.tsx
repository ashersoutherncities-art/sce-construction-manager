import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Link from 'next/link';
import StatusBadge, { PROJECT_STATUSES, STATUS_CONFIG, normalizeStatus } from '@/components/StatusBadge';

interface Budget {
  id: string;
  totalBudget: number;
  amountSpent: number;
  category: string;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
}

interface Project {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  status: string;
  clientName: string;
  clientEmail: string;
  costEstimate: number | null;
  progress: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  budgets: Budget[];
  invoices: Invoice[];
  subcontractorAssignments: any[];
}

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession({ required: true });
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (session) fetchProjects();
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

  const getProjectBudget = (project: Project) => {
    if (project.budgets && project.budgets.length > 0) {
      return project.budgets.reduce((sum, b) => sum + b.totalBudget, 0);
    }
    return project.costEstimate || 0;
  };

  const getProjectSpent = (project: Project) => {
    if (project.budgets && project.budgets.length > 0) {
      return project.budgets.reduce((sum, b) => sum + b.amountSpent, 0);
    }
    return 0;
  };

  const filteredProjects = projects.filter((p) => {
    const statusMatch = filter === 'all' || normalizeStatus(p.status) === filter;
    const query = searchQuery.toLowerCase();
    const searchMatch =
      !query ||
      p.clientName?.toLowerCase().includes(query) ||
      p.address?.toLowerCase().includes(query) ||
      p.name?.toLowerCase().includes(query) ||
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

  const totalBudget = projects.reduce((sum, p) => sum + getProjectBudget(p), 0);
  const totalSpent = projects.reduce((sum, p) => sum + getProjectSpent(p), 0);
  const totalSubs = projects.reduce((sum, p) => sum + (p.subcontractorAssignments?.length || 0), 0);

  if (authStatus === 'loading' || authStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <Layout title="Project Dashboard">
      {/* User Info Banner */}
      <div className="bg-sce-navy text-white rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-300">Logged in as</p>
            <p className="text-xl font-semibold">{session?.user?.name || session?.user?.email}</p>
            <p className="text-sm text-gray-400">{session?.user?.email}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Personal Dashboard</p>
            <p className="text-lg font-semibold">Only Your Projects</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Link href="/budget" className="bg-white rounded-lg shadow-lg p-5 hover:ring-2 hover:ring-sce-orange transition-all">
          <div className="text-2xl font-bold text-green-600">${totalBudget.toLocaleString()}</div>
          <div className="text-sce-gray text-sm">Total Budget</div>
        </Link>
        <Link href="/budget" className="bg-white rounded-lg shadow-lg p-5 hover:ring-2 hover:ring-sce-orange transition-all">
          <div className="text-2xl font-bold text-red-600">${totalSpent.toLocaleString()}</div>
          <div className="text-sce-gray text-sm">Total Spent</div>
        </Link>
        <Link href="/subcontractors" className="bg-white rounded-lg shadow-lg p-5 hover:ring-2 hover:ring-sce-orange transition-all">
          <div className="text-2xl font-bold text-blue-600">{totalSubs}</div>
          <div className="text-sce-gray text-sm">Active Assignments</div>
        </Link>
        <Link href="/analytics" className="bg-white rounded-lg shadow-lg p-5 hover:ring-2 hover:ring-sce-orange transition-all">
          <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
          <div className="text-sce-gray text-sm">View Analytics</div>
        </Link>
      </div>

      {/* Status Cards */}
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
                <div className={`text-2xl font-bold ${config.color}`}>{stats[status as keyof typeof stats]}</div>
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
            placeholder="Search projects by name, client, address, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sce-orange focus:border-transparent"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              filter === 'all' ? 'bg-sce-navy text-white' : 'bg-gray-100 text-sce-gray hover:bg-gray-200'
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
                  filter === status ? 'bg-sce-orange text-white' : 'bg-gray-100 text-sce-gray hover:bg-gray-200'
                }`}
              >
                <span>{config.icon}</span>
                {config.label} ({stats[status as keyof typeof stats]})
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sce-navy text-white">
              <tr>
                <th className="px-6 py-4 text-left">Project</th>
                <th className="px-6 py-4 text-left">Client</th>
                <th className="px-6 py-4 text-left">Location</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Budget</th>
                <th className="px-6 py-4 text-left">Progress</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sce-gray">
                    Loading projects...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sce-gray">
                    {searchQuery ? 'No projects match your search' : 'No projects yet. Create one from New Project.'}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const budget = getProjectBudget(project);
                  const spent = getProjectSpent(project);
                  return (
                    <tr key={project.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold">{project.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{project.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4">{project.clientName || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {[project.address, project.city, project.state].filter(Boolean).join(', ') || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold">${budget.toLocaleString()}</div>
                        {spent > 0 && (
                          <div className="text-xs text-red-500">Spent: ${spent.toLocaleString()}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-sce-orange h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{project.progress}%</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/project/${project.id}`}
                          className="text-sce-orange hover:underline font-semibold"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
