import { useState, useMemo } from 'react';
import { Sparkles, Filter, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import { ActionModal } from '@/components/shared/ActionModal';
import type { ActionItem, InsightCategory, Priority } from '@/types';

const categoryFilters: { id: InsightCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'payments', label: 'Payments' },
  { id: 'customers', label: 'Customers' },
  { id: 'conversion', label: 'Conversion' },
];

const priorityFilters: { id: Priority | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

export const Insights = () => {
  const { showToast, insights } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<InsightCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);

  const filteredInsights = useMemo(() => {
    return insights.filter((i) => {
      if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && i.priority !== priorityFilter) return false;
      return true;
    });
  }, [insights, categoryFilter, priorityFilter]);

  const handleApproveAction = (insight: typeof insights[0]) => {
    const action: ActionItem = {
      id: insight.actionId ?? `act-${insight.id}`,
      title: insight.title,
      type: insight.category === 'payments' ? 'revenue_recovery' : insight.category === 'conversion' ? 'conversion' : 'customer_growth',
      trigger: 'ai_insight',
      reason: insight.why,
      estimatedImpact: insight.estimatedImpact,
      confidence: insight.priority === 'high' ? 92 : insight.priority === 'medium' ? 81 : 76,
      risk: insight.priority === 'high' ? 'medium' : 'low',
      status: 'pending',
      date: 'Aug 22, 2026',
      affectedCustomers: insight.category === 'payments' ? 126 : undefined,
    };
    setSelectedAction(action);
    setActionModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">AI Insights</h1>
        <p className="mt-1 text-sm text-gray-500">AI-generated explanations and recommendations based on your business data.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Category</span>
          {categoryFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setCategoryFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                categoryFilter === f.id
                  ? 'bg-navy-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Priority</span>
          {priorityFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setPriorityFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                priorityFilter === f.id
                  ? 'bg-accent-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insight Cards */}
      {filteredInsights.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center justify-center py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
              <Sparkles className="h-6 w-6 text-gray-300" />
            </div>
            <p className="mt-3 text-sm font-semibold text-navy-900">No insights match your filters</p>
            <p className="mt-1 text-xs text-gray-400">Try adjusting the category or priority filters to see more insights.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredInsights.map((insight) => (
            <Card key={insight.id} className="flex flex-col">
              <CardBody className="flex flex-1 flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={insight.priority} />
                    <CategoryBadge category={insight.category} />
                  </div>
                </div>

                <h3 className="mt-3 text-base font-bold text-navy-900">{insight.title}</h3>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">What happened</p>
                    <p className="mt-0.5 text-sm text-navy-700">{insight.whatHappened}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Why it happened</p>
                    <p className="mt-0.5 text-sm text-navy-700">{insight.why}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Business impact</p>
                    <p className="mt-0.5 text-sm font-semibold text-emerald-700">{insight.impact}</p>
                  </div>
                  <div className="rounded-lg bg-accent-50 border border-accent-100 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-accent-600">AI Recommendation</p>
                    <p className="mt-0.5 text-sm text-navy-700">{insight.recommendation}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Estimated Impact</p>
                      <p className="text-sm font-bold text-navy-900">{insight.estimatedImpact}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex gap-2 pt-4">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => showToast('info', 'Insight reviewed', 'This insight has been marked as reviewed.')}>
                    Review
                  </Button>
                  {insight.actionId && (
                    <Button size="sm" variant="primary" className="flex-1" onClick={() => handleApproveAction(insight)}>
                      Approve Action
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <ActionModal open={actionModalOpen} onClose={() => setActionModalOpen(false)} action={selectedAction} source="AI Insights" />
    </div>
  );
};
