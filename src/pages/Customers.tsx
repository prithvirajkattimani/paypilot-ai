import { useState, useMemo } from 'react';
import {
  Crown, RefreshCw, AlertTriangle, CreditCard, Search, Mail, ShoppingBag,
  TrendingUp, Sparkles, ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { formatCurrency } from '@/lib/format';
import type { Customer, CustomerSegment } from '@/types';

const segmentMeta: Record<CustomerSegment, { label: string; icon: typeof Crown; color: string; bg: string; text: string }> = {
  high_value: { label: 'High Value', icon: Crown, color: 'text-amber-600', bg: 'bg-amber-50', text: 'text-amber-700' },
  returning: { label: 'Returning', icon: RefreshCw, color: 'text-accent-600', bg: 'bg-accent-50', text: 'text-accent-700' },
  at_risk: { label: 'At Risk', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', text: 'text-red-700' },
  failed_payment: { label: 'Failed Payment', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50', text: 'text-orange-700' },
};

const riskColors: Record<string, string> = {
  low: 'text-emerald-600 bg-emerald-50',
  medium: 'text-amber-600 bg-amber-50',
  high: 'text-red-600 bg-red-50',
};

export const Customers = () => {
  const { data, setCurrentPage } = useApp();
  const [selected, setSelected] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment | 'all'>('all');

  const segmentCards = useMemo(() => {
    const segments: CustomerSegment[] = ['high_value', 'returning', 'at_risk', 'failed_payment'];
    return segments.map((seg) => {
      const customers = data.customers.filter((c) => c.segment === seg);
      const revenue = customers.reduce((sum, c) => sum + c.lifetimeValue, 0);
      const meta = segmentMeta[seg];
      const cardData: Record<CustomerSegment, { count: string; revenue: string }> = {
        high_value: { count: '1,248', revenue: '₹6.4L' },
        returning: { count: '3,820', revenue: '+14.2% repeat rate' },
        at_risk: { count: '642', revenue: '₹82K potential' },
        failed_payment: { count: '126', revenue: '₹38.5K recovery' },
      };
      return { seg, meta, ...cardData[seg] };
    });
  }, [data.customers]);

  const filteredCustomers = useMemo(() => {
    return data.customers.filter((c) => {
      if (segmentFilter !== 'all' && c.segment !== segmentFilter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data.customers, segmentFilter, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Customer Intelligence</h1>
        <p className="mt-1 text-sm text-gray-500">AI-powered customer segments and revenue opportunities.</p>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {segmentCards.map(({ seg, meta, count, revenue }) => {
          const Icon = meta.icon;
          return (
            <Card key={seg} hover onClick={() => setSegmentFilter(seg === segmentFilter ? 'all' : seg)} className={`p-4 ${segmentFilter === seg ? 'border-accent-300 ring-1 ring-accent-200' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${meta.bg}`}>
                  <Icon className={`h-5 w-5 ${meta.color}`} />
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${meta.text}`}>{meta.label}</p>
                  <p className="text-lg font-bold text-navy-900">{count}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">{revenue}</p>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-navy-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>
        {segmentFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setSegmentFilter('all')}>Clear filter</Button>
        )}
      </div>

      {/* Customer Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Segment</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Orders</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Lifetime Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Last Purchase</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">AI Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => {
                const meta = segmentMeta[c.segment];
                const Icon = meta.icon;
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-700">
                          {c.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.bg} ${meta.text}`}>
                        <Icon className="h-3 w-3" /> {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right"><span className="text-sm text-navy-700">{c.orders}</span></td>
                    <td className="px-4 py-3 text-right"><span className="text-sm font-bold text-navy-900">{formatCurrency(c.lifetimeValue)}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-600">{c.lastPurchase}</span></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${riskColors[c.risk]}`}>
                        {c.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-600 line-clamp-1">{c.recommendation}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredCustomers.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-navy-900">No customers found</p>
            <p className="mt-1 text-xs text-gray-400">Try adjusting your search or segment filter.</p>
          </div>
        )}
      </Card>

      {/* Customer Detail Drawer */}
      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Customer Profile" width="max-w-lg">
        {selected && (
          <div className="space-y-5">
            {/* Profile */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-lg font-bold text-white">
                {selected.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-lg font-bold text-navy-900">{selected.name}</h2>
                <p className="text-sm text-gray-500">{selected.email}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${segmentMeta[selected.segment].bg} ${segmentMeta[selected.segment].text}`}>
                    {segmentMeta[selected.segment].label}
                  </span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${riskColors[selected.risk]}`}>
                    {selected.risk} risk
                  </span>
                </div>
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <p className="text-xs">Total Orders</p>
                </div>
                <p className="mt-1 text-lg font-bold text-navy-900">{selected.orders}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <p className="text-xs">Lifetime Value</p>
                </div>
                <p className="mt-1 text-lg font-bold text-emerald-700">{formatCurrency(selected.lifetimeValue)}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Recent Activity</p>
              <div className="mt-2 space-y-2">
                {selected.recentActivity.map((act, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${act.action.includes('failed') ? 'bg-red-500' : act.action.includes('Purchase') ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span className="text-sm text-navy-700">{act.action}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{act.date}</p>
                      {act.amount && <p className="text-xs font-semibold text-navy-900">₹{act.amount.toLocaleString('en-IN')}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div className="rounded-lg border border-accent-100 bg-accent-50 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-600" />
                <p className="text-xs font-bold uppercase tracking-wide text-accent-600">AI Insight</p>
              </div>
              <p className="mt-2 text-sm text-navy-700">{selected.aiInsight}</p>
            </div>

            {/* Recommended Action */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Recommended Next Action</p>
              <p className="mt-1 text-sm font-semibold text-navy-900">{selected.recommendation}</p>
              <Button size="sm" variant="primary" className="mt-3 w-full" onClick={() => { setSelected(null); setCurrentPage('actions'); }}>
                Go to Action Center <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
