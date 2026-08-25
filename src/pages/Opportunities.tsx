import { useState, useMemo } from 'react';
import { Target, TrendingUp, AlertTriangle, BarChart3, ArrowUpDown, ChevronRight, Brain, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PriorityBadge, CategoryBadge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { Opportunity, Priority, OpportunityCategory, ActionItem } from '@/types';

type SortKey = 'impact' | 'confidence' | 'priority';

const priorityFilters: { id: Priority | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

const priorityOrder: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

const categoryLabels: Record<OpportunityCategory, string> = {
  revenue_recovery: 'Revenue Recovery',
  customer_growth: 'Customer Growth',
  payments: 'Payments',
  conversion: 'Conversion',
};

export const Opportunities = () => {
  const { createAction, showToast, setCurrentPage, opportunities } = useApp();
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortKey>('impact');
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [createdActionIds, setCreatedActionIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = opportunities.filter((o) => priorityFilter === 'all' || o.priority === priorityFilter);
    result = [...result].sort((a, b) => {
      if (sortBy === 'impact') return b.impactValue - a.impactValue;
      if (sortBy === 'confidence') return b.confidence - a.confidence;
      if (sortBy === 'priority') return priorityOrder[b.priority] - priorityOrder[a.priority];
      return 0;
    });
    return result;
  }, [opportunities, priorityFilter, sortBy]);

  const totalOpportunities = opportunities.length;
  const revenuePotential = opportunities.reduce((sum, o) => sum + o.impactValue, 0);
  const highPriorityCount = opportunities.filter((o) => o.priority === 'high').length;
  const avgConfidence = opportunities.length > 0 ? Math.round(opportunities.reduce((sum, o) => sum + o.confidence, 0) / opportunities.length) : 0;

  const summaryCards = [
    { label: 'Total Opportunities', value: totalOpportunities.toString(), sublabel: 'Detected by AI', icon: Target, color: 'text-navy-600', bg: 'bg-navy-50' },
    { label: 'Revenue Potential', value: `₹${(revenuePotential / 100000).toFixed(2)}L`, sublabel: 'Estimated impact', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'High Priority', value: highPriorityCount.toString(), sublabel: 'Require attention', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Avg. Confidence', value: `${avgConfidence}%`, sublabel: 'AI confidence', icon: BarChart3, color: 'text-accent-600', bg: 'bg-accent-50' },
  ];

  const handleCreateAction = (opp: Opportunity) => {
    if (createdActionIds.has(opp.id)) {
      showToast('info', 'Already created', 'An action for this opportunity is already pending approval.');
      return;
    }
    const actionType = opp.category === 'revenue_recovery' ? 'revenue_recovery' :
      opp.category === 'customer_growth' ? 'customer_growth' :
      opp.category === 'conversion' ? 'conversion' : 'payments';
    createAction({
      title: opp.title,
      type: actionType,
      trigger: 'ai_recommendation',
      reason: opp.problem,
      estimatedImpact: opp.potentialImpact,
      confidence: opp.confidence,
      risk: opp.riskLevel,
      affectedCustomers: opp.id === 'opp-1' ? 126 : opp.id === 'opp-5' ? 642 : undefined,
    });
    setCreatedActionIds((prev) => new Set(prev).add(opp.id));
    showToast('success', 'Action created', `${opp.title} has been added to Action Center as Pending Approval.`);
    setSelected(null);
  };

  const handleReviewOpportunity = (opp: Opportunity) => {
    setSelected(opp);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Revenue Opportunities</h1>
        <p className="mt-1 text-sm text-gray-500">AI-detected opportunities to recover revenue and accelerate growth.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                <Icon className={`h-[18px] w-[18px] ${card.color}`} />
              </div>
              <p className="mt-3 text-xs font-medium text-gray-500">{card.label}</p>
              <p className="mt-1 text-xl font-bold text-navy-900">{card.value}</p>
              <p className="mt-0.5 text-xs text-gray-400">{card.sublabel}</p>
            </Card>
          );
        })}
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-navy-900">AI-Detected Opportunities</h2>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option value="impact">Sort: Impact</option>
            <option value="confidence">Sort: Confidence</option>
            <option value="priority">Sort: Priority</option>
          </select>
        </div>
      </div>

      {/* Priority Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {priorityFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setPriorityFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              priorityFilter === f.id
                ? 'bg-navy-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Opportunity Cards */}
      {filtered.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center justify-center py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
              <Target className="h-6 w-6 text-gray-300" />
            </div>
            <p className="mt-3 text-sm font-semibold text-navy-900">No opportunities match your filters</p>
            <p className="mt-1 text-xs text-gray-400">No new AI opportunities detected. PayPilot AI will continue analyzing your business activity.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((opp) => {
            const isCreated = createdActionIds.has(opp.id);
            return (
              <Card key={opp.id} className="flex flex-col">
                <CardBody className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={opp.priority} />
                      <CategoryBadge category={opp.category} />
                    </div>
                    {isCreated && <StatusBadge status="in_progress" />}
                  </div>

                  <h3 className="mt-3 text-base font-bold text-navy-900">{opp.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{opp.problem}</p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] text-gray-400">Estimated Impact</p>
                      <p className="text-sm font-bold text-emerald-700">{opp.potentialImpact}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 rounded-full bg-gray-200">
                          <div className="h-full rounded-full bg-accent-500" style={{ width: `${opp.confidence}%` }} />
                        </div>
                        <span className="text-sm font-bold text-navy-900">{opp.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    {opp.recommendedAction === 'Review Opportunity' ? (
                      <Button size="sm" variant="outline" className="w-full" onClick={() => handleReviewOpportunity(opp)}>
                        Review Opportunity
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant={isCreated ? 'ghost' : 'primary'}
                        className="w-full"
                        disabled={isCreated}
                        onClick={() => handleCreateAction(opp)}
                      >
                        {isCreated ? 'Action Created' : 'Create Action'}
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Opportunity Details"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
            <Button
              variant="primary"
              onClick={() => selected && handleCreateAction(selected)}
              disabled={selected ? createdActionIds.has(selected.id) : false}
            >
              {selected && createdActionIds.has(selected.id) ? 'Action Created' : 'Create Action'}
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={selected.priority} />
                <CategoryBadge category={selected.category} />
              </div>
              <h3 className="mt-3 text-lg font-bold text-navy-900">{selected.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{selected.problem}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-400">Estimated Impact</p>
                <p className="mt-1 text-lg font-bold text-emerald-700">{selected.potentialImpact}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-400">AI Confidence</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-accent-500" style={{ width: `${selected.confidence}%` }} />
                  </div>
                  <span className="text-sm font-bold text-navy-900">{selected.confidence}%</span>
                </div>
              </div>
            </div>

            {selected.supportingMetrics && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Supporting Metrics</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {selected.supportingMetrics.map((m) => (
                    <div key={m.label} className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
                      <p className="text-[11px] text-gray-400">{m.label}</p>
                      <p className="text-sm font-bold text-navy-900">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Evidence</p>
              <p className="mt-1 text-sm text-navy-700">{selected.evidence}</p>
            </div>

            <div className="rounded-lg border border-accent-100 bg-accent-50 p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent-600" />
                <p className="text-xs font-bold uppercase tracking-wide text-accent-600">AI Reasoning</p>
              </div>
              <p className="mt-2 text-sm text-navy-700">{selected.aiReasoning}</p>
            </div>

            {selected.recommendedNextStep && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-navy-600" />
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Recommended Next Step</p>
                </div>
                <p className="mt-1 text-sm font-semibold text-navy-900">{selected.recommendedNextStep}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Risk Level:</span>
              <span className="text-sm font-semibold capitalize text-navy-900">{selected.riskLevel}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
