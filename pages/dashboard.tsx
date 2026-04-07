import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Link from 'next/link';
import StatusBadge, { PROJECT_STATUSES, STATUS_CONFIG, normalizeStatus } from '@/components/StatusBadge';

interface Project {
  id: string;
  timestamp?: string;
  createdAt?: string;
  clientName: string;
  propertyAddress?: string;
  address?: string;
  name?: string;
  status: string;
  budgetMax?: number;
  costEstimate?: number;
  progress?: number;
}

export const getServerSideProps = async () => {
  return { props: {} };
};

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession({ required: true });
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetSummary, setBudgetSummary] = useState({ totalBudget: 0, totalSpent: 0, count: 0 });
  const [subSummary, setSubSummary] = useState({ totalSubs: 0, assignments: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    if (authStatus === 'unauthenticated') router.push('/login');
  }, [authStatus, router]);

  useEffect(() => {
    if (session) fetchAllData();
  }, [session]);

  const fetchAllData = async () => {
    try {
      const [projRes, budgetRes, subRes, assignRes] = await Promise.all([
        fetch('/api/projects/list'),
        fetch('/api/budgets').catch(() => null),
        fetch('/api/subcontractors').catch(() => null),
        fetch('/api/subcontractors/assignments').catch(() => null),
      ]);

      const projData = await projRes.json();
      if (projData.success) setProjects(projData.projects);

      if (budgetRes) {
        const bd = await budgetRes.json();
        if (bd.success && bd.budgets) {
          setBudgetSummary({
            totalBudget: bd.budgets.reduce((s: number, b: any) => s + b.totalBudget, 0),
            totalSpent: bd.budgets.reduce((s: number, b: any) => s + b.amountSpent, 0),
            count: bd.budgets.length,
          });
        }
      }

      if (subRes && assignRes) {
        const sd = await subRes.json();
        const ad = await assignRes.json();
        if (sd.success && ad.success) {
          const assigns = ad.assignments || [];
          setSubSummary({
            totalSubs: (sd.subcontractors || []).length,
            assignments: assigns.length,
            inProgress: assigns.filter((a: any) => a.status === 'in_progress').length,
            completed: assigns.filter((a: any) => a.status === 'completed').length,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      (p.propertyAddress || p.address || '')?.toLowerCase().includes(query) ||
      p.name?.toLowerCase().includes(query) ||
      p.id?.toLowerCase().includes(query);
    return statusMatch && searchMatch;
  });

  const stats: Record<string, number> = {
    total: projects.length,
    intake: projects.filter((p) => normalizeStatus(p.status) === 'intake').length,
    analyzing: projects.filter((p) => normalizeStatus(p.status) === 'analyzing').length,
    underwriting: projects.filter((p) => normalizeStatus(p.status) === 'underwriting').length,
    accepted: projects.filter((p) => normalizeStatus(p.status) === 'accepted').length,
    closed: projects.filter((p) => normalizeStatus(p.status) === 'closed').length,
  };

  const budgetPct = budgetSummary.totalBudget > 0
    ? Math.round((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100) : 0;

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

      {/* 4 Feature Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard" className="bg-white rounded-lg shadow-lg p-5 hover:shadow-xl transition-shadow border-t-4 border-sce-navy">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-sce-navy flex items-center justify-center text-white font-bold">P</div>
            <div>
              <div className="text-sm text-sce-gray">Project Tracking</div>
              <div className="text-2xl font-bold text-sce-navy">{stats.total}</div>
            </div>
          </div>
          <div className="text-xs text-sce-gray">{stats.accepted} accepted, {stats.intake} intake</div>
        </Link>

        <Link href="/budget" className="bg-white rounded-lg shadow-lg p-5 hover:shadow-xl transition-shadow border-t-4 border-green-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">$</div>
            <div>
              <div className="text-sm text-sce-gray">Budget</div>
              <div className="text-2xl font-bold text-green-600">${budgetSummary.totalBudget.toLocaleString()}</div>
            </div>
          </div>
          <div className="text-xs text-sce-gray">{budgetPct}% utilized ({budgetSummary.count} budgets)</div>
          {budgetSummary.totalBudget > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className={`h-2 rounded-full ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
            </div>
          )}
        </Link>

        <Link href="/subcontractors" className="bg-white rounded-lg shadow-lg p-5 hover:shadow-xl transition-shadow border-t-4 border-sce-orange">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-sce-orange flex items-center justify-center text-white font-bold">S</div>
            <div>
              <div className="text-sm text-sce-gray">Subcontractors</div>
              <div className="text-2xl font-bold text-sce-orange">{subSummary.totalSubs}</div>
            </div>
          </div>
          <div className="text-xs text-sce-gray">{subSummary.inProgress} in progress, {subSummary.completed} completed</div>
        </Link>

        <Link href="/analytics" className="bg-white rounded-lg shadow-lg p-5 hover:shadow-xl transition-shadow border-t-4 border-purple-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold">A</div>
            <div>
              <div className="text-sm text-sce-gray">Analytics</div>
              <div className="text-2xl font-bold text-purple-600">View</div>
            </div>
          </div>
          <div className="text-xs text-sce-gray">Reports & insights</div>
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
            className={`px-4 py-2 rounded-full font-semibold transition-all ${filter === 'all' ? 'bg-sce-navy text-white' : 'bg-gray-100 text-sce-gray hover:bg-gray-200'}`}
          >
            All ({stats.total})
          </button>
          {PROJECT_STATUSES.map((status) => {
            const config = STATUS_CONFIG[status];
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-1.5 ${filter === status ? 'bg-sce-orange text-white' : 'bg-gray-100 text-sce-gray hover:bg-gray-200'}`}
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
                <th className="px-6 py-4 text-left">Project</th>
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
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sce-gray">Loading projects...</td></tr>
              ) : filteredProjects.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sce-gray">{searchQuery ? 'No projects match your search' : 'No projects found'}</td></tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{project.name || project.clientName}</div>
                      <div className="text-xs text-gray-400 font-mono">{project.id.length > 12 ? project.id.slice(0, 8) : project.id}</div>
                    </td>
                    <td className="px-6 py-4">{project.clientName || '-'}</td>
                    <td className="px-6 py-4 text-sm">{project.propertyAddress || project.address || '-'}</td>
                    <td className="px-6 py-4"><StatusBadge status={project.status} /></td>
                    <td className="px-6 py-4">${(project.budgetMax || project.costEstimate || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{new Date(project.timestamp || project.createdAt || '').toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Link href={`/project/${project.id}`} className="text-sce-orange hover:underline font-semibold">View</Link>
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
