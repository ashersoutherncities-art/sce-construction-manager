import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

interface Subcontractor {
  id: string;
  name: string;
  company: string;
  trade: string;
  phone: string;
  email: string;
  licenseNumber: string;
  rating: number;
  location: string;
  notes: string;
  assignments: Assignment[];
}

interface Assignment {
  id: string;
  task: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  amount: number | null;
  notes: string;
  project: { id: string; name: string };
  subcontractor?: { name: string; trade: string };
}

interface ProjectOption {
  id: string;
  name: string;
}

export default function SubcontractorsPage() {
  const { data: session, status: authStatus } = useSession({ required: true });
  const router = useRouter();
  const [subs, setSubs] = useState<Subcontractor[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'directory' | 'assignments'>('directory');
  const [showSubForm, setShowSubForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [searchTrade, setSearchTrade] = useState('');

  useEffect(() => {
    if (authStatus === 'unauthenticated') router.push('/login');
  }, [authStatus, router]);

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      const [subsRes, assignRes, projRes] = await Promise.all([
        fetch('/api/subcontractors'),
        fetch('/api/subcontractors/assignments'),
        fetch('/api/projects/db-list'),
      ]);
      const [subsData, assignData, projData] = await Promise.all([
        subsRes.json(),
        assignRes.json(),
        projRes.json(),
      ]);
      if (subsData.success) setSubs(subsData.subcontractors);
      if (assignData.success) setAssignments(assignData.assignments);
      if (projData.success) setProjects(projData.projects);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSub = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch('/api/subcontractors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if ((await res.json()).success) {
      setShowSubForm(false);
      fetchData();
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch('/api/subcontractors/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if ((await res.json()).success) {
      setShowAssignForm(false);
      fetchData();
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await fetch('/api/subcontractors/assignments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const filteredSubs = subs.filter((s) =>
    searchTrade ? s.trade.toLowerCase().includes(searchTrade.toLowerCase()) : true
  );

  const totalAssigned = assignments.length;
  const inProgress = assignments.filter((a) => a.status === 'in_progress').length;
  const completed = assignments.filter((a) => a.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'on_hold': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (authStatus === 'loading' || authStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <Layout title="Subcontractor Hub">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-sm text-sce-gray">Subcontractors</div>
          <div className="text-2xl font-bold text-sce-navy">{subs.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-sm text-sce-gray">Total Assignments</div>
          <div className="text-2xl font-bold text-sce-orange">{totalAssigned}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-sm text-sce-gray">In Progress</div>
          <div className="text-2xl font-bold text-yellow-600">{inProgress}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-sm text-sce-gray">Completed</div>
          <div className="text-2xl font-bold text-green-600">{completed}</div>
        </div>
      </div>

      {/* Tabs + Actions */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${activeTab === 'directory' ? 'bg-sce-navy text-white' : 'bg-white text-sce-gray shadow'}`}
        >
          Directory ({subs.length})
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${activeTab === 'assignments' ? 'bg-sce-navy text-white' : 'bg-white text-sce-gray shadow'}`}
        >
          Assignments ({assignments.length})
        </button>
        <div className="ml-auto flex gap-2">
          {activeTab === 'directory' && (
            <button onClick={() => setShowSubForm(!showSubForm)} className="bg-sce-orange text-white px-6 py-2 rounded-full font-semibold hover:bg-sce-navy transition-all">
              + Add Subcontractor
            </button>
          )}
          {activeTab === 'assignments' && (
            <button onClick={() => setShowAssignForm(!showAssignForm)} className="bg-sce-orange text-white px-6 py-2 rounded-full font-semibold hover:bg-sce-navy transition-all">
              + Assign Task
            </button>
          )}
        </div>
      </div>

      {/* Add Subcontractor Form */}
      {showSubForm && activeTab === 'directory' && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-serif font-bold mb-4">Add Subcontractor</h3>
          <form onSubmit={handleCreateSub} className="grid md:grid-cols-2 gap-4">
            <input name="name" placeholder="Full Name *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="company" placeholder="Company Name" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="trade" placeholder="Trade (e.g., Electrician) *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="phone" type="tel" placeholder="Phone" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="email" type="email" placeholder="Email" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="licenseNumber" placeholder="License Number" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="location" placeholder="Location (e.g., Charlotte, NC)" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="notes" placeholder="Notes" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <button type="submit" className="bg-sce-orange text-white px-6 py-2 rounded-full font-semibold hover:bg-sce-navy transition-all">
              Add Subcontractor
            </button>
          </form>
        </div>
      )}

      {/* Assign Task Form */}
      {showAssignForm && activeTab === 'assignments' && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-serif font-bold mb-4">Assign Task to Subcontractor</h3>
          <form onSubmit={handleCreateAssignment} className="grid md:grid-cols-2 gap-4">
            <select name="projectId" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange">
              <option value="">Select Project *</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select name="subcontractorId" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange">
              <option value="">Select Subcontractor *</option>
              {subs.map((s) => (
                <option key={s.id} value={s.id}>{s.name} - {s.trade}</option>
              ))}
            </select>
            <input name="task" placeholder="Task Description *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="amount" type="number" step="0.01" placeholder="Amount ($)" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="startDate" type="date" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="endDate" type="date" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="notes" placeholder="Notes" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <button type="submit" className="bg-sce-orange text-white px-6 py-2 rounded-full font-semibold hover:bg-sce-navy transition-all">
              Assign Task
            </button>
          </form>
        </div>
      )}

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Filter by trade..."
              value={searchTrade}
              onChange={(e) => setSearchTrade(e.target.value)}
              className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange"
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 text-sce-gray">Loading...</div>
            ) : filteredSubs.length === 0 ? (
              <div className="col-span-full text-center py-12 text-sce-gray">No subcontractors yet. Add one above.</div>
            ) : (
              filteredSubs.map((sub) => (
                <div key={sub.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-sce-navy">{sub.name}</h3>
                      {sub.company && <p className="text-sm text-sce-gray">{sub.company}</p>}
                    </div>
                    <span className="bg-sce-orange text-white px-3 py-1 rounded-full text-xs font-semibold">{sub.trade}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    {sub.location && <div className="flex justify-between"><span className="text-sce-gray">Location:</span><span>{sub.location}</span></div>}
                    {sub.phone && <div className="flex justify-between"><span className="text-sce-gray">Phone:</span><a href={`tel:${sub.phone}`} className="text-sce-orange">{sub.phone}</a></div>}
                    {sub.email && <div className="flex justify-between"><span className="text-sce-gray">Email:</span><a href={`mailto:${sub.email}`} className="text-sce-orange">{sub.email}</a></div>}
                    {sub.licenseNumber && <div className="flex justify-between"><span className="text-sce-gray">License:</span><span>{sub.licenseNumber}</span></div>}
                    <div className="flex justify-between"><span className="text-sce-gray">Assignments:</span><span className="font-semibold">{sub.assignments.length}</span></div>
                  </div>
                  {sub.notes && <p className="mt-3 pt-3 border-t text-xs text-sce-gray">{sub.notes}</p>}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-sce-navy text-white">
              <tr>
                <th className="px-6 py-4 text-left">Subcontractor</th>
                <th className="px-6 py-4 text-left">Project</th>
                <th className="px-6 py-4 text-left">Task</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sce-gray">Loading...</td></tr>
              ) : assignments.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sce-gray">No assignments yet. Assign a task above.</td></tr>
              ) : (
                assignments.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{a.subcontractor?.name || '-'}</td>
                    <td className="px-6 py-4">{a.project.name}</td>
                    <td className="px-6 py-4 text-sm">{a.task}</td>
                    <td className="px-6 py-4 text-right">{a.amount ? `$${a.amount.toLocaleString()}` : '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(a.status)}`}>
                        {a.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={a.status}
                        onChange={(e) => handleUpdateStatus(a.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-sce-orange"
                      >
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
