import { useState, useMemo } from 'react';
import { History as HistoryIcon, ChevronRight, Bot, Sparkles, Target, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CategoryBadge, StatusBadge } from '@/components/ui/Badge';
import type { ActionItem, ActionTrigger } from '@/types';

const triggerFilters: { id: ActionTrigger | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ai_copilot', label: 'AI Copilot' },
  { id: 'ai_insight', label: 'AI Insight' },
  { id: 'ai_recommendation', label: 'AI Recommendation' },
  { id: 'manual', label: 'Manual' },
];

const triggerIcons: Record<string, typeof Bot> = {
  ai_copilot: Bot,
  ai_insight: Sparkles,
  ai_recommendation: Target,
  manual: User,
};

const triggerLabels: Record<string, string> = {
  ai_copilot: 'AI Copilot',
  ai_insight: 'AI Insight',
  ai_recommendation: 'AI Recommendation',
  manual: 'Manual',
};

export const History = () => {
  const { actions } = useApp();
  const [filter, setFilter] = useState<ActionTrigger | 'all'>('all');
  const [selected, setSelected] = useState<ActionItem | null>(null);

  const historyActions = useMemo(() => {
    return actions
      .filter((a) => a.status === 'completed' || a.status === 'rejected')
      .filter((a) => filter === 'all' || a.trigger === filter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [actions, filter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Action History</h1>
        <p className="mt-1 text-sm text-gray-500">Track all actions executed by PayPilot AI and their outcomes.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {triggerFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === f.id
                ? 'bg-navy-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {historyActions.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center justify-center py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
              <HistoryIcon className="h-6 w-6 text-gray-300" />
            </div>
            <p className="mt-3 text-sm font-semibold text-navy-900">No action history yet</p>
            <p className="mt-1 text-xs text-gray-400">Completed and rejected actions will appear here with their full details and outcomes.</p>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Triggered By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Impact</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {historyActions.map((action) => {
                    const TriggerIcon = triggerIcons[action.trigger] ?? User;
                    return (
                      <tr
                        key={action.id}
                        onClick={() => setSelected(action)}
                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-navy-900">{action.title}</p>
                        </td>
                        <td className="px-4 py-3"><CategoryBadge category={action.type} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <TriggerIcon className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs text-navy-700">{triggerLabels[action.trigger]}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-xs text-gray-600">{action.date}</span></td>
                        <td className="px-4 py-3"><StatusBadge status={action.status} /></td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-emerald-700">
                            {action.result?.estimatedRecovered ?? action.result?.impact ?? action.estimatedImpact}
                          </span>
                        </td>
                        <td className="px-4 py-3"><ChevronRight className="h-4 w-4 text-gray-400" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Cards */}
          <div className="grid gap-3 lg:hidden">
            {historyActions.map((action) => {
              const TriggerIcon = triggerIcons[action.trigger] ?? User;
              return (
                <Card key={action.id} hover onClick={() => setSelected(action)}>
                  <CardBody>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-navy-900">{action.title}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <CategoryBadge category={action.type} />
                          <StatusBadge status={action.status} />
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <TriggerIcon className="h-3.5 w-3.5" />
                        {triggerLabels[action.trigger]}
                      </div>
                      <span className="text-gray-400">{action.date}</span>
                      <span className="font-semibold text-emerald-700">
                        {action.result?.estimatedRecovered ?? action.result?.impact ?? action.estimatedImpact}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Action Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-navy-900">{selected.title}</h3>
              <div className="mt-2 flex items-center gap-2">
                <CategoryBadge category={selected.type} />
                <StatusBadge status={selected.status} />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Reason</p>
              <p className="mt-1 text-sm text-navy-700">{selected.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-400">Triggered By</p>
                <p className="mt-1 text-sm font-semibold text-navy-900">{triggerLabels[selected.trigger]}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-400">Date</p>
                <p className="mt-1 text-sm font-semibold text-navy-900">{selected.date}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-400">AI Confidence</p>
                <p className="mt-1 text-sm font-semibold text-navy-900">{selected.confidence}%</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-400">Risk Level</p>
                <p className="mt-1 text-sm font-semibold capitalize text-navy-900">{selected.risk}</p>
              </div>
            </div>

            {selected.result && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Outcome</p>
                <div className="mt-2 space-y-1">
                  {selected.result.customersProcessed && (
                    <p className="text-sm text-emerald-800">{selected.result.customersProcessed} customers processed</p>
                  )}
                  {selected.result.estimatedRecovered && (
                    <p className="text-sm text-emerald-800">{selected.result.estimatedRecovered} estimated recovered</p>
                  )}
                  {selected.result.recoveryRate && (
                    <p className="text-sm text-emerald-800">Recovery rate: {selected.result.recoveryRate}%</p>
                  )}
                  {selected.result.impact && !selected.result.estimatedRecovered && (
                    <p className="text-sm text-emerald-800">Impact: {selected.result.impact}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
              <Bot className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <p className="text-xs text-gray-500">This was a simulated prototype action. No real financial transactions were processed.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
