import { useState, useMemo } from 'react';
import { Zap, Clock, CheckCircle2, Loader2, AlertTriangle, Users, Target, TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { CategoryBadge, StatusBadge } from '@/components/ui/Badge';
import { ActionModal } from '@/components/shared/ActionModal';
import type { ActionItem } from '@/types';

export const Actions = () => {
  const { actions, showToast, rejectAction, approveAction } = useApp();
  const [activeTab, setActiveTab] = useState('pending');
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);

  const pending = actions.filter((a) => a.status === 'pending');
  const inProgress = actions.filter((a) => a.status === 'in_progress');
  const completed = actions.filter((a) => a.status === 'completed');

  const filtered = activeTab === 'pending' ? pending : activeTab === 'in_progress' ? inProgress : completed;

  const tabs = [
    { id: 'pending', label: 'Pending Approval', count: pending.length },
    { id: 'in_progress', label: 'In Progress', count: inProgress.length },
    { id: 'completed', label: 'Completed', count: completed.length },
  ];

  const handleReview = (action: ActionItem) => {
    setSelectedAction(action);
    setActionModalOpen(true);
  };

  const handleApprove = (action: ActionItem) => {
    approveAction(action.id);
  };

  const handleReject = (action: ActionItem) => {
    rejectAction(action.id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Action Center</h1>
        <p className="mt-1 text-sm text-gray-500">Review and approve actions recommended by PayPilot AI.</p>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {filtered.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center justify-center py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
              {activeTab === 'pending' ? <Zap className="h-6 w-6 text-gray-300" /> : activeTab === 'in_progress' ? <Clock className="h-6 w-6 text-gray-300" /> : <CheckCircle2 className="h-6 w-6 text-gray-300" />}
            </div>
            <p className="mt-3 text-sm font-semibold text-navy-900">
              {activeTab === 'pending' ? 'No actions pending approval' : activeTab === 'in_progress' ? 'No actions in progress' : 'No completed actions yet'}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {activeTab === 'pending' ? 'PayPilot AI will surface recommended actions here when opportunities are detected.' : 'Actions will appear here once they are processed.'}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((action) => (
            <Card key={action.id} className={action.status === 'in_progress' ? 'border-accent-200' : ''}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.status === 'completed' ? 'bg-emerald-50' : action.status === 'in_progress' ? 'bg-accent-50' : 'bg-navy-50'}`}>
                      {action.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : action.status === 'in_progress' ? <Loader2 className="h-5 w-5 animate-spin text-accent-600" /> : <Zap className="h-5 w-5 text-navy-600" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy-900">{action.title}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <CategoryBadge category={action.type} />
                        <StatusBadge status={action.status} />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm text-gray-600">{action.reason}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-[11px] text-gray-400">Est. Impact</p>
                    <p className="text-sm font-bold text-emerald-700">{action.estimatedImpact}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Confidence</p>
                    <p className="text-sm font-bold text-navy-900">{action.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Risk</p>
                    <p className="text-sm font-bold capitalize text-navy-900">{action.risk}</p>
                  </div>
                  {action.affectedCustomers && (
                    <div>
                      <p className="text-[11px] text-gray-400">Customers</p>
                      <p className="text-sm font-bold text-navy-900">{action.affectedCustomers}</p>
                    </div>
                  )}
                </div>

                {action.status === 'completed' && action.result && (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Result</p>
                    <div className="mt-1.5 space-y-1">
                      {action.result.customersProcessed && (
                        <p className="text-xs text-emerald-800">{action.result.customersProcessed} customers processed</p>
                      )}
                      {action.result.estimatedRecovered && (
                        <p className="text-xs text-emerald-800">{action.result.estimatedRecovered} estimated recovered</p>
                      )}
                      {action.result.recoveryRate && (
                        <p className="text-xs text-emerald-800">Recovery rate: {action.result.recoveryRate}%</p>
                      )}
                      {action.result.impact && !action.result.estimatedRecovered && (
                        <p className="text-xs text-emerald-800">Impact: {action.result.impact}</p>
                      )}
                    </div>
                  </div>
                )}

                {action.status === 'in_progress' && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent-50 p-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-accent-600" />
                    <p className="text-xs text-accent-700 font-medium">Simulated workflow executing...</p>
                  </div>
                )}

                {action.status === 'pending' && (
                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleReview(action)}>Review</Button>
                    <Button size="sm" variant="ghost" className="flex-1" onClick={() => handleReject(action)}>Reject</Button>
                    <Button size="sm" variant="primary" className="flex-1" onClick={() => handleApprove(action)}>Approve</Button>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <ActionModal open={actionModalOpen} onClose={() => setActionModalOpen(false)} action={selectedAction} source="Action Center" />
    </div>
  );
};
