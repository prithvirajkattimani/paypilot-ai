import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertTriangle, Target, Zap, ArrowRight, X,
  CheckCircle2, Wallet, Sparkles, Trophy, ChevronRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import { ActionModal } from '@/components/shared/ActionModal';
import { getRangeLabel } from '@/data/insights';
import type { ActionItem } from '@/types';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-elevated">
      <p className="text-xs font-semibold text-navy-900 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
          {p.name}: ₹{p.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-elevated">
      <p className="text-xs font-semibold text-navy-900 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export const Overview = () => {
  const { data, dateRange, setCurrentPage, showToast, insights, opportunities } = useApp();
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [dismissedRecommended, setDismissedRecommended] = useState(false);

  const m = data.metrics;

  const kpiCards = [
    { label: 'Total Revenue', value: m.totalRevenue, change: m.revenueChange, positive: true, icon: TrendingUp, sublabel: 'vs previous period' },
    { label: 'Payment Success Rate', value: m.successRate, change: m.successRateChange, positive: true, icon: CheckCircle2, sublabel: 'vs previous period' },
    { label: 'Failed Payments', value: m.failedPayments.toString(), change: m.failedPaymentsChange, positive: true, icon: AlertTriangle, sublabel: 'vs previous period' },
    { label: 'Revenue at Risk', value: m.revenueAtRisk, change: m.revenueAtRiskChange, positive: false, icon: Wallet, sublabel: 'recoverable' },
    { label: 'AI Opportunity Score', value: `${m.opportunityScore}/100`, change: '', positive: null, icon: Sparkles, sublabel: m.opportunityLabel },
  ];

  const priorityInsights = insights.slice(0, 3);

  const topOpportunities = [...opportunities]
    .sort((a, b) => b.impactValue - a.impactValue)
    .slice(0, 3);
  const totalOpportunityValue = opportunities.reduce((sum, o) => sum + o.impactValue, 0);

  const recommendedAction = topOpportunities[0]
    ? {
        id: topOpportunities[0].id,
        title: topOpportunities[0].title,
        description: `${topOpportunities[0].problem} PayPilot AI estimates ${topOpportunities[0].potentialImpact} in recoverable revenue.`,
      }
    : { id: 'act-1', title: 'Recover failed payments', description: 'No opportunities detected for this period.' };

  const handleReviewAction = () => {
    const opp = topOpportunities[0];
    if (!opp) return;
    const action = {
      id: opp.id,
      title: opp.title,
      type: (opp.category === 'revenue_recovery' ? 'revenue_recovery' : opp.category === 'conversion' ? 'conversion' : 'customer_growth') as ActionItem['type'],
      trigger: 'ai_copilot' as const,
      reason: opp.problem,
      estimatedImpact: opp.potentialImpact,
      confidence: opp.confidence,
      risk: opp.riskLevel as 'low' | 'medium' | 'high',
      status: 'pending' as const,
      date: new Date(2026, 7, 24).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      affectedCustomers: opp.supportingMetrics?.find((s) => s.label.includes('Customers'))
        ? parseInt(opp.supportingMetrics.find((s) => s.label.includes('Customers'))!.value.replace(/[^0-9]/g, ''), 10)
        : undefined,
    };
    setSelectedAction(action);
    setActionModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Good morning, Alex</h1>
        <p className="mt-1 text-sm text-gray-500">Here's what PayPilot AI found across your business.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const isPositive = kpi.positive === true;
          const isNegative = kpi.positive === false;
          return (
            <Card key={kpi.label} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                  <Icon className="h-[18px] w-[18px] text-navy-600" />
                </div>
                {kpi.change && (
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
                    {isPositive && <TrendingUp className="h-3 w-3" />}
                    {isNegative && <TrendingDown className="h-3 w-3" />}
                    {kpi.change}
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs font-medium text-gray-500">{kpi.label}</p>
              <p className="mt-1 text-xl font-bold text-navy-900">{kpi.value}</p>
              <p className="mt-0.5 text-xs text-gray-400">{kpi.sublabel}</p>
            </Card>
          );
        })}
      </div>

      {/* Revenue Opportunity Score Section */}
      <Card className="border-accent-200 bg-gradient-to-r from-accent-50 via-white to-white">
        <CardBody>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Score */}
            <div className="flex items-center gap-5">
              <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#0b5cff" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(m.opportunityScore / 100) * 213.6} 213.6`} />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold text-navy-900">{m.opportunityScore}</span>
                  <span className="text-[10px] text-gray-400">/ 100</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-600" />
                  <span className="text-xs font-bold uppercase tracking-wide text-accent-600">Revenue Opportunity Score</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-navy-900">High growth potential detected</p>
                <p className="mt-0.5 text-xs text-gray-500">PayPilot AI analyzed {m.totalTransactions.toLocaleString('en-IN')} transactions {getRangeLabel(dateRange)} and identified recoverable revenue.</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6">
              <div>
                <p className="text-xl font-bold text-emerald-700">₹{(totalOpportunityValue / 100000).toFixed(2)}L</p>
                <p className="mt-0.5 text-xs text-gray-500">Potential revenue identified</p>
              </div>
              <div>
                <p className="text-xl font-bold text-navy-900">{opportunities.length}</p>
                <p className="mt-0.5 text-xs text-gray-500">Opportunities detected</p>
              </div>
              <div>
                <p className="text-xl font-bold text-red-600">{opportunities.filter(o => o.priority === 'high').length}</p>
                <p className="mt-0.5 text-xs text-gray-500">High priority actions</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <p className="mt-0.5 text-xs text-gray-400">Current vs previous period · {dateRange === 'today' ? 'Today' : dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : '90 days'}</p>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.revenueSeries}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0b5cff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0b5cff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={5} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <RTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="previous" name="Previous" stroke="#94a3b8" strokeWidth={1.5} fill="url(#colorPrev)" />
                <Area type="monotone" dataKey="current" name="Current" stroke="#0b5cff" strokeWidth={2} fill="url(#colorCurrent)" />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="line" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Payment Performance */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Payment Performance</CardTitle>
              <p className="mt-0.5 text-xs text-gray-400">Successful vs failed payments</p>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.paymentSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={5} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RTooltip content={<BarTooltip />} />
                <Bar dataKey="success" name="Successful" fill="#10b981" radius={[3, 3, 0, 0]} barSize={10} />
                <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={10} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Top Revenue Opportunities */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-bold text-navy-900">Top Revenue Opportunities</h2>
          </div>
          <button onClick={() => setCurrentPage('opportunities')} className="flex items-center gap-1 text-xs font-semibold text-accent-600 hover:text-accent-700">
            View all opportunities <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {topOpportunities.map((opp) => (
            <Card key={opp.id} hover className="flex flex-col">
              <CardBody className="flex flex-1 flex-col">
                <div className="flex items-center justify-between">
                  <PriorityBadge priority={opp.priority} />
                  <CategoryBadge category={opp.category} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-navy-900">{opp.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{opp.problem}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-gray-400">Est. Impact</p>
                    <p className="text-base font-bold text-emerald-700">{opp.potentialImpact}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Confidence</p>
                    <p className="text-base font-bold text-navy-900">{opp.confidence}%</p>
                  </div>
                </div>
                <div className="mt-auto pt-4">
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setCurrentPage('opportunities')}>
                    View Opportunity <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Priority Insights */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-navy-900">AI Priority Insights</h2>
          <button onClick={() => setCurrentPage('insights')} className="flex items-center gap-1 text-xs font-semibold text-accent-600 hover:text-accent-700">
            View all insights <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {priorityInsights.map((insight) => (
            <Card key={insight.id} hover className="flex flex-col">
              <CardBody className="flex flex-1 flex-col">
                <div className="flex items-center justify-between">
                  <PriorityBadge priority={insight.priority} />
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{insight.category}</span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-navy-900">{insight.title}</h3>
                <p className="mt-2 text-xs text-gray-500">{insight.whatHappened}</p>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
                  <Target className="h-3.5 w-3.5 text-emerald-600" />
                  <p className="text-xs font-semibold text-emerald-700">Impact: {insight.impact}</p>
                </div>
                <div className="mt-auto pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (insight.actionId) {
                        const action = {
                          id: insight.actionId,
                          title: insight.title,
                          type: (insight.category === 'payments' ? 'revenue_recovery' : insight.category === 'conversion' ? 'conversion' : 'customer_growth') as ActionItem['type'],
                          trigger: 'ai_insight' as const,
                          reason: insight.why,
                          estimatedImpact: insight.estimatedImpact,
                          confidence: insight.priority === 'high' ? 92 : insight.priority === 'medium' ? 81 : 76,
                          risk: (insight.priority === 'high' ? 'medium' : 'low') as 'low' | 'medium' | 'high',
                          status: 'pending' as const,
                          date: new Date(2026, 7, 24).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                          affectedCustomers: insight.category === 'payments' ? data.metrics.failedPayments : undefined,
                        };
                        setSelectedAction(action);
                        setActionModalOpen(true);
                      } else {
                        setCurrentPage('insights');
                      }
                    }}
                  >
                    {insight.cta}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Recommended Next Action */}
      {!dismissedRecommended && (
        <Card className="border-accent-200 bg-gradient-to-r from-accent-50 to-white">
          <CardBody>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent-600 shadow-md">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-accent-600">Recommended Next Action</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">Prototype</span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-navy-900">{recommendedAction.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{recommendedAction.description}</p>
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <Button variant="ghost" onClick={() => { setDismissedRecommended(true); showToast('info', 'Action dismissed', 'You can revisit this in the Action Center.'); }}>
                  <X className="h-4 w-4" /> Dismiss
                </Button>
                <Button variant="primary" onClick={handleReviewAction}>
                  Review Action
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <ActionModal open={actionModalOpen} onClose={() => setActionModalOpen(false)} action={selectedAction} source="Dashboard" />
    </div>
  );
};
