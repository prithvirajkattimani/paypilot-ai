import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { CreditCard, CheckCircle2, XCircle, TrendingUp, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { DateRange, TransactionStatus, Transaction } from '@/types';

const dateFilters: { id: DateRange; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
];

const statusFilters: { id: TransactionStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'success', label: 'Success' },
  { id: 'failed', label: 'Failed' },
  { id: 'pending', label: 'Pending' },
];

const LineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-elevated">
      <p className="text-xs font-semibold text-navy-900">{label}</p>
      <p className="text-xs text-accent-600">Success Rate: {payload[0]?.value}%</p>
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-elevated">
      <p className="text-xs font-semibold text-navy-900">{payload[0].name}</p>
      <p className="text-xs text-gray-500">{payload[0].value}% of transactions</p>
    </div>
  );
};

export const Payments = () => {
  const { data, dateRange, setDateRange } = useApp();
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const m = data.metrics;

  const kpiCards = [
    { label: 'Total Transactions', value: m.totalTransactions.toLocaleString('en-IN'), icon: CreditCard, color: 'text-navy-600' },
    { label: 'Success Rate', value: m.successRate, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Failed Transactions', value: m.failedPayments.toString(), icon: XCircle, color: 'text-red-600' },
    { label: 'Avg Transaction Value', value: m.avgTransactionValue, icon: TrendingUp, color: 'text-accent-600' },
  ];

  const filteredTransactions = useMemo(() => {
    return data.transactions.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (search && !t.id.toLowerCase().includes(search.toLowerCase()) && !t.customer.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data.transactions, statusFilter, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Payments Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Track payment performance, success rates, and failure patterns.</p>
      </div>

      {/* Date Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {dateFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setDateRange(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              dateRange === f.id
                ? 'bg-navy-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                <Icon className={`h-[18px] w-[18px] ${kpi.color}`} />
              </div>
              <p className="mt-3 text-xs font-medium text-gray-500">{kpi.label}</p>
              <p className="mt-1 text-xl font-bold text-navy-900">{kpi.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Success Rate Over Time */}
        <Card>
          <CardHeader><CardTitle>Payment Success Rate Over Time</CardTitle></CardHeader>
          <CardBody className="pt-2">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.successRateSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={5} />
                <YAxis domain={[85, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <RTooltip content={<LineTooltip />} />
                <Line type="monotone" dataKey="rate" name="Success Rate" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Successful vs Failed */}
        <Card>
          <CardHeader><CardTitle>Successful vs Failed Payments</CardTitle></CardHeader>
          <CardBody className="pt-2">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.paymentSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={5} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RTooltip
                  content={({ active, payload, label }) => active && payload?.length ? (
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-elevated">
                      <p className="text-xs font-semibold text-navy-900">{label}</p>
                      {payload.map((p: any) => (
                        <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>{p.name}: {p.value}</p>
                      ))}
                    </div>
                  ) : null}
                />
                <Bar dataKey="success" name="Successful" fill="#10b981" radius={[3, 3, 0, 0]} barSize={8} />
                <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={8} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Payment Method Distribution */}
        <Card>
          <CardHeader><CardTitle>Payment Method Distribution</CardTitle></CardHeader>
          <CardBody className="pt-2">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.paymentMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2}>
                  {data.paymentMethods.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <RTooltip content={<PieTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Failure Reason Breakdown */}
        <Card>
          <CardHeader><CardTitle>Failure Reason Breakdown</CardTitle></CardHeader>
          <CardBody className="pt-2">
            <div className="space-y-3 pt-2">
              {data.failureReasons.map((reason) => (
                <div key={reason.reason}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: reason.color }} />
                      <span className="text-sm font-medium text-navy-700">{reason.reason}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{reason.count}</span>
                      <span className="text-sm font-bold text-navy-900">{reason.percentage}%</span>
                    </div>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-gray-100">
                    <div className="h-full rounded-full" style={{ width: `${reason.percentage}%`, backgroundColor: reason.color }} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-44 rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-xs text-navy-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          </div>
        </CardHeader>
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-2">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                statusFilter === f.id
                  ? 'bg-accent-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Transaction ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Failure Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.slice(0, 30).map((t) => (
                <tr key={t.id} onClick={() => setSelectedTxn(t)} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-4 py-3"><span className="font-mono text-xs text-navy-700">{t.id}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-600">{t.date}</span></td>
                  <td className="px-4 py-3"><span className="text-sm text-navy-700">{t.customer}</span></td>
                  <td className="px-4 py-3 text-right"><span className="text-sm font-semibold text-navy-900">₹{t.amount.toLocaleString('en-IN')}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-600">{t.method}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-500">{t.failureReason ?? '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-navy-900">No transactions found</p>
            <p className="mt-1 text-xs text-gray-400">Try adjusting your search or status filter.</p>
          </div>
        )}
      </Card>

      {/* Transaction Detail Modal */}
      <Modal open={!!selectedTxn} onClose={() => setSelectedTxn(null)} title="Transaction Details" size="md">
        {selectedTxn && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Transaction ID</p>
                <p className="mt-1 font-mono text-sm text-navy-900">{selectedTxn.id}</p>
              </div>
              <StatusBadge status={selectedTxn.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-400">Amount</p>
                <p className="mt-1 text-lg font-bold text-navy-900">₹{selectedTxn.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-400">Payment Method</p>
                <p className="mt-1 text-sm font-semibold text-navy-900">{selectedTxn.method}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-400">Customer</p>
                <p className="mt-1 text-sm font-semibold text-navy-900">{selectedTxn.customer}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-400">Date</p>
                <p className="mt-1 text-sm font-semibold text-navy-900">{selectedTxn.date}</p>
              </div>
            </div>

            {selectedTxn.failureReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-red-600">Failure Reason</p>
                <p className="mt-1 text-sm text-red-800">{selectedTxn.failureReason}</p>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
              <CreditCard className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <p className="text-xs text-gray-500">This is simulated transaction data for prototype demonstration. No real payment was processed.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
