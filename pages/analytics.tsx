import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

interface Analytics {
  projects: {
    total: number;
    byStatus: Record<string, number>;
    averageProgress: number;
  };
  budget: {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    utilization: number;
    byProject: { projectName: string; totalBudget: number; amountSpent: number; utilization: number }[];
  };
  invoices: {
    total: number;
    byStatus: Record<string, number>;
    amountByStatus: Record<string, number>;
  };
  subcontractors: {
    total: number;
    performance: { name: string; trade: string; total: number; completed: number; inProgress: number; rating: number }[];
  };
  trends: {
    monthly: Record<string, number>;
  };
}

const STATUS_COLORS: Record<string, string> = {
  intake: '#3B82F6',
  analyzing: '#F59E0B',
  underwriting: '#8B5CF6',
  accepted: '#10B981',
  closed: '#6B7280',
  'in-progress': '#F97316',
};

const STATUS_LABELS: Record<string, string> = {
  intake: 'Intake',
  analyzing: 'Analyzing',
  underwriting: 'Underwriting',
  accepted: 'Accepted',
  closed: 'Closed',
  'in-progress': 'In Progress',
};

function BarChart({ data, maxValue }: { data: { label: string; value: number; color: string }[]; maxValue: number }) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">{item.label}</span>
            <span className="text-sce-gray">{item.value}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-semibold transition-all"
              style={{ width: `${Math.max((item.value / maxValue) * 100, 8)}%`, backgroundColor: item.color }}
            >
              {item.value > 0 ? item.value : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, total, centerLabel }: { data: { label: string; value: number; color: string }[]; total: number; centerLabel: string }) {
  let cumulative = 0;
  const segments = data.filter((d) => d.value > 0).map((d) => {
    const pct = (d.value / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start };
  });

  const gradient = segments.length > 0
    ? segments.map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`).join(', ')
    : '#e5e7eb 0% 100%';

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-36 h-36 rounded-full flex items-center justify-center relative"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-sce-navy">{total}</div>
            <div className="text-xs text-sce-gray">{centerLabel}</div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
            <span>{d.label}: <strong>{d.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: session, status: authStatus } = useSession({ required: true });
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === 'unauthenticated') router.push('/login');
  }, [authStatus, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/analytics/summary')
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setAnalytics(data.analytics);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (authStatus === 'loading' || authStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (loading) {
    return (
      <Layout title="Analytics">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sce-orange" />
        </div>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout title="Analytics">
        <div className="text-center py-20 text-sce-gray">Failed to load analytics data.</div>
      </Layout>
    );
  }

  const { projects, budget, invoices, subcontractors, trends } = analytics;

  const statusChartData = Object.entries(projects.byStatus).map(([status, count]) => ({
    label: STATUS_LABELS[status] || status,
    value: count,
    color: STATUS_COLORS[status] || '#9CA3AF',
  }));

  const invoiceChartData = [
    { label: 'Pending', value: invoices.byStatus['pending'] || 0, color: '#F59E0B' },
    { label: 'Paid', value: invoices.byStatus['paid'] || 0, color: '#10B981' },
    { label: 'Overdue', value: invoices.byStatus['overdue'] || 0, color: '#EF4444' },
  ];

  return (
    <Layout title="Analytics & Reports">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-sm text-sce-gray">Total Projects</div>
          <div className="text-3xl font-bold text-sce-navy">{projects.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-sm text-sce-gray">Total Budget</div>
          <div className="text-3xl font-bold text-sce-navy">${budget.totalBudget.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-sm text-sce-gray">Total Spent</div>
          <div className="text-3xl font-bold text-sce-orange">${budget.totalSpent.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-sm text-sce-gray">Budget Utilization</div>
          <div className={`text-3xl font-bold ${budget.utilization > 90 ? 'text-red-600' : budget.utilization > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
            {budget.utilization}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-5">
          <div className="text-sm text-sce-gray">Subcontractors</div>
          <div className="text-3xl font-bold text-sce-navy">{subcontractors.total}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Projects by Status */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-serif font-bold text-sce-navy mb-4">Projects by Status</h2>
          {statusChartData.length > 0 ? (
            <DonutChart data={statusChartData} total={projects.total} centerLabel="Projects" />
          ) : (
            <p className="text-sce-gray text-center py-8">No project data yet</p>
          )}
        </div>

        {/* Invoice Status */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-serif font-bold text-sce-navy mb-4">Invoice Status</h2>
          {invoices.total > 0 ? (
            <DonutChart data={invoiceChartData} total={invoices.total} centerLabel="Invoices" />
          ) : (
            <p className="text-sce-gray text-center py-8">No invoice data yet</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Budget by Project */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-serif font-bold text-sce-navy mb-4">Budget Utilization by Project</h2>
          {budget.byProject.length > 0 ? (
            <div className="space-y-4">
              {budget.byProject.map((bp) => (
                <div key={bp.projectName}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{bp.projectName}</span>
                    <span className="text-sce-gray">{Math.round(bp.utilization)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${bp.utilization > 90 ? 'bg-red-500' : bp.utilization > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(bp.utilization, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-sce-gray mt-1">
                    <span>${bp.amountSpent.toLocaleString()} spent</span>
                    <span>${bp.totalBudget.toLocaleString()} budget</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sce-gray text-center py-8">No budget data yet</p>
          )}
        </div>

        {/* Subcontractor Performance */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-serif font-bold text-sce-navy mb-4">Subcontractor Performance</h2>
          {subcontractors.performance.length > 0 ? (
            <div className="space-y-4">
              {subcontractors.performance.map((sp) => {
                const completionRate = sp.total > 0 ? Math.round((sp.completed / sp.total) * 100) : 0;
                return (
                  <div key={sp.name} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="font-semibold text-sce-navy">{sp.name}</div>
                      <div className="text-xs text-sce-gray">{sp.trade}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-sce-navy">{sp.total}</div>
                      <div className="text-xs text-sce-gray">Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{sp.completed}</div>
                      <div className="text-xs text-sce-gray">Done</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${completionRate >= 80 ? 'text-green-600' : completionRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {completionRate}%
                      </div>
                      <div className="text-xs text-sce-gray">Rate</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sce-gray text-center py-8">No subcontractor data yet</p>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-serif font-bold text-sce-navy mb-4">Project Creation Trend (Last 6 Months)</h2>
        {Object.keys(trends.monthly).length > 0 ? (
          <BarChart
            data={Object.entries(trends.monthly)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([month, count]) => ({
                label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                value: count,
                color: '#fa8c41',
              }))}
            maxValue={Math.max(...Object.values(trends.monthly), 1)}
          />
        ) : (
          <p className="text-sce-gray text-center py-8">No trend data yet</p>
        )}
      </div>

      {/* Financial Summary Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-serif font-bold text-sce-navy mb-4">Financial Summary</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-sm text-blue-600 font-semibold mb-2">Total Budget Allocated</div>
            <div className="text-2xl font-bold text-blue-900">${budget.totalBudget.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
            <div className="text-sm text-orange-600 font-semibold mb-2">Total Amount Spent</div>
            <div className="text-2xl font-bold text-orange-900">${budget.totalSpent.toLocaleString()}</div>
          </div>
          <div className={`p-4 rounded-lg ${budget.remaining >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`text-sm font-semibold mb-2 ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {budget.remaining >= 0 ? 'Budget Remaining' : 'Over Budget'}
            </div>
            <div className={`text-2xl font-bold ${budget.remaining >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              ${Math.abs(budget.remaining).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
