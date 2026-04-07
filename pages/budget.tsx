import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

interface Budget {
  id: string;
  totalBudget: number;
  amountSpent: number;
  category: string;
  notes: string;
  project: { id: string; name: string; status: string };
  payments: { id: string; amount: number; paidAt: string }[];
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  amount: number;
  status: string;
  dueDate: string | null;
  paidDate: string | null;
  description: string;
  project: { id: string; name: string };
}

interface ProjectOption {
  id: string;
  name: string;
}

export default function BudgetPage() {
  const { data: session, status: authStatus } = useSession({ required: true });
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'budgets' | 'invoices'>('budgets');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);

  useEffect(() => {
    if (authStatus === 'unauthenticated') router.push('/login');
  }, [authStatus, router]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [budgetRes, invoiceRes, projectRes] = await Promise.all([
        fetch('/api/budgets'),
        fetch('/api/budgets/invoices'),
        fetch('/api/projects/db-list'),
      ]);
      const [budgetData, invoiceData, projectData] = await Promise.all([
        budgetRes.json(),
        invoiceRes.json(),
        projectRes.json(),
      ]);
      if (budgetData.success) setBudgets(budgetData.budgets);
      if (invoiceData.success) setInvoices(invoiceData.invoices);
      if (projectData.success) setProjects(projectData.projects);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.totalBudget, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.amountSpent, 0);
  const pendingInvoices = invoices.filter((i) => i.status === 'pending');
  const paidInvoices = invoices.filter((i) => i.status === 'paid');

  const handleCreateBudget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if ((await res.json()).success) {
      setShowBudgetForm(false);
      fetchData();
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch('/api/budgets/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if ((await res.json()).success) {
      setShowInvoiceForm(false);
      fetchData();
    }
  };

  const handleUpdateInvoiceStatus = async (id: string, status: string) => {
    await fetch('/api/budgets/invoices', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  if (authStatus === 'loading' || authStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <Layout title="Budget Tracking">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-sm text-sce-gray">Total Budget</div>
          <div className="text-2xl font-bold text-sce-navy">${totalBudget.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-sm text-sce-gray">Amount Spent</div>
          <div className="text-2xl font-bold text-sce-orange">${totalSpent.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-sm text-sce-gray">Remaining</div>
          <div className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${(totalBudget - totalSpent).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-sm text-sce-gray">Pending Invoices</div>
          <div className="text-2xl font-bold text-yellow-600">{pendingInvoices.length}</div>
        </div>
      </div>

      {/* Budget Utilization Bars */}
      {budgets.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-serif font-bold text-sce-navy mb-4">Budget Utilization by Project</h2>
          <div className="space-y-4">
            {budgets.map((b) => {
              const pct = b.totalBudget > 0 ? Math.min((b.amountSpent / b.totalBudget) * 100, 100) : 0;
              return (
                <div key={b.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{b.project.name} ({b.category})</span>
                    <span className="text-sce-gray">
                      ${b.amountSpent.toLocaleString()} / ${b.totalBudget.toLocaleString()} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${activeTab === 'budgets' ? 'bg-sce-navy text-white' : 'bg-white text-sce-gray shadow'}`}
        >
          Budgets ({budgets.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${activeTab === 'invoices' ? 'bg-sce-navy text-white' : 'bg-white text-sce-gray shadow'}`}
        >
          Invoices ({invoices.length})
        </button>
        <button
          onClick={() => activeTab === 'budgets' ? setShowBudgetForm(!showBudgetForm) : setShowInvoiceForm(!showInvoiceForm)}
          className="ml-auto bg-sce-orange text-white px-6 py-2 rounded-full font-semibold hover:bg-sce-navy transition-all"
        >
          + Add {activeTab === 'budgets' ? 'Budget' : 'Invoice'}
        </button>
      </div>

      {/* Add Budget Form */}
      {showBudgetForm && activeTab === 'budgets' && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-serif font-bold mb-4">Create Budget</h3>
          <form onSubmit={handleCreateBudget} className="grid md:grid-cols-2 gap-4">
            <select name="projectId" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange">
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input name="totalBudget" type="number" step="0.01" placeholder="Total Budget ($)" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="category" placeholder="Category (e.g., Materials, Labor)" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="notes" placeholder="Notes" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <button type="submit" className="bg-sce-orange text-white px-6 py-2 rounded-full font-semibold hover:bg-sce-navy transition-all">
              Create Budget
            </button>
          </form>
        </div>
      )}

      {/* Add Invoice Form */}
      {showInvoiceForm && activeTab === 'invoices' && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-serif font-bold mb-4">Create Invoice</h3>
          <form onSubmit={handleCreateInvoice} className="grid md:grid-cols-2 gap-4">
            <select name="projectId" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange">
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input name="invoiceNumber" placeholder="Invoice Number *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="vendor" placeholder="Vendor Name *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="amount" type="number" step="0.01" placeholder="Amount ($) *" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="dueDate" type="date" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <input name="description" placeholder="Description" className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-sce-orange" />
            <button type="submit" className="bg-sce-orange text-white px-6 py-2 rounded-full font-semibold hover:bg-sce-navy transition-all">
              Create Invoice
            </button>
          </form>
        </div>
      )}

      {/* Budgets Table */}
      {activeTab === 'budgets' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-sce-navy text-white">
              <tr>
                <th className="px-6 py-4 text-left">Project</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-right">Budget</th>
                <th className="px-6 py-4 text-right">Spent</th>
                <th className="px-6 py-4 text-right">Remaining</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sce-gray">Loading...</td></tr>
              ) : budgets.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sce-gray">No budgets yet. Create one above.</td></tr>
              ) : (
                budgets.map((b) => {
                  const pct = b.totalBudget > 0 ? (b.amountSpent / b.totalBudget) * 100 : 0;
                  return (
                    <tr key={b.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{b.project.name}</td>
                      <td className="px-6 py-4">{b.category}</td>
                      <td className="px-6 py-4 text-right">${b.totalBudget.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-sce-orange">${b.amountSpent.toLocaleString()}</td>
                      <td className={`px-6 py-4 text-right ${b.totalBudget - b.amountSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(b.totalBudget - b.amountSpent).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pct > 90 ? 'bg-red-100 text-red-700' : pct > 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {Math.round(pct)}% used
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoices Table */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-sce-navy text-white">
              <tr>
                <th className="px-6 py-4 text-left">Invoice #</th>
                <th className="px-6 py-4 text-left">Vendor</th>
                <th className="px-6 py-4 text-left">Project</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Due Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sce-gray">Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sce-gray">No invoices yet. Create one above.</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4">{inv.vendor}</td>
                    <td className="px-6 py-4">{inv.project.name}</td>
                    <td className="px-6 py-4 text-right">${inv.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-sm">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                        inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {inv.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateInvoiceStatus(inv.id, 'paid')}
                          className="text-green-600 hover:underline text-sm font-semibold"
                        >
                          Mark Paid
                        </button>
                      )}
                      {inv.status === 'paid' && (
                        <span className="text-sm text-sce-gray">{inv.paidDate ? new Date(inv.paidDate).toLocaleDateString() : 'Paid'}</span>
                      )}
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
