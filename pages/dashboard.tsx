import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';

interface Project {
  id: string;
  timestamp: string;
  clientName: string;
  propertyAddress: string;
  status: string;
  budgetMax: number;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const filteredProjects = projects.filter(
    (p) => filter === 'all' || p.status === filter
  );

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    analyzing: 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-purple-100 text-purple-800',
    accepted: 'bg-green-100 text-green-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'in-progress').length,
    quoted: projects.filter((p) => p.status === 'quoted').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  };

  return (
    <Layout title="Project Dashboard">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-3xl font-bold text-sce-navy">{stats.total}</div>
          <div className="text-sce-gray">Total Projects</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-3xl font-bold text-sce-orange">{stats.active}</div>
          <div className="text-sce-gray">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-3xl font-bold text-purple-600">{stats.quoted}</div>
          <div className="text-sce-gray">Quoted</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sce-gray">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              filter === 'all'
                ? 'bg-sce-navy text-white'
                : 'bg-gray-100 text-sce-gray hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {['new', 'analyzing', 'quoted', 'accepted', 'in-progress', 'completed'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  filter === status
                    ? 'bg-sce-orange text-white'
                    : 'bg-gray-100 text-sce-gray hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            )
          )}
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
                    No projects found
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm">{project.id}</td>
                    <td className="px-6 py-4">{project.clientName}</td>
                    <td className="px-6 py-4 text-sm">{project.propertyAddress}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColors[project.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {project.status}
                      </span>
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
