import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';
import type { ActionItem } from '@/types';
import { AlertTriangle, CheckCircle2, Loader2, Info, Shield } from 'lucide-react';

interface ActionModalProps {
  open: boolean;
  onClose: () => void;
  action: ActionItem | null;
  source?: string;
}

export const ActionModal = ({ open, onClose, action, source }: ActionModalProps) => {
  const { approveAction, rejectAction, setCurrentPage, showToast } = useApp();
  const [confirming, setConfirming] = useState(false);
  const [executing, setExecuting] = useState(false);

  if (!action) return null;

  const handleApprove = () => {
    setConfirming(false);
    setExecuting(true);
    approveAction(action.id);
    setTimeout(() => {
      setExecuting(false);
      onClose();
      showToast('success', 'Action approved successfully.', `${action.title} has been completed and added to Action History.`);
    }, 2600);
  };

  const handleReject = () => {
    rejectAction(action.id);
    onClose();
  };

  const triggerLabels: Record<string, string> = {
    ai_copilot: 'AI Copilot',
    ai_insight: 'AI Insight',
    ai_recommendation: 'AI Recommendation',
    manual: 'Manual',
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={confirming ? 'Confirm Action' : 'Action Details'}
      size="lg"
      footer={
        confirming ? (
          <>
            <Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button>
            <Button variant="success" onClick={handleApprove} disabled={executing}>
              {executing ? <><Loader2 className="h-4 w-4 animate-spin" /> Executing...</> : 'Confirm & Execute'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button variant="outline" onClick={handleReject}>Reject</Button>
            <Button variant="primary" onClick={() => setConfirming(true)}>Review & Approve</Button>
          </>
        )
      }
    >
      {executing ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-accent-600" />
          <p className="mt-4 text-sm font-semibold text-navy-900">Executing simulated workflow...</p>
          <p className="mt-1 text-xs text-gray-500">Processing {action.affectedCustomers ?? 0} customers</p>
        </div>
      ) : confirming ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Please review before confirming</p>
              <p className="mt-1 text-xs text-amber-700">This is a simulated prototype action. No real financial transactions will be processed.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Action</p>
              <p className="mt-0.5 text-sm font-bold text-navy-900">{action.title}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">What will happen</p>
              <p className="mt-0.5 text-sm text-navy-700">{action.reason}</p>
            </div>
            {action.affectedCustomers && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Affected Customers</p>
                <p className="mt-0.5 text-sm font-semibold text-navy-900">{action.affectedCustomers} customers will be processed</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Estimated Impact</p>
                <p className="mt-0.5 text-sm font-bold text-emerald-700">{action.estimatedImpact}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">AI Confidence</p>
                <p className="mt-0.5 text-sm font-bold text-navy-900">{action.confidence}%</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Risk Level</p>
              <p className="mt-0.5 text-sm capitalize text-navy-900">{action.risk}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
            <Shield className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <p className="text-xs text-gray-500">PayPilot AI will not independently move money. All actions require your explicit approval.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-navy-900">{action.title}</h3>
              <div className="mt-1.5 flex items-center gap-2">
                <CategoryBadge category={action.type} />
                <span className="text-xs text-gray-400">via {triggerLabels[action.trigger] ?? action.trigger}</span>
                {source && <span className="text-xs text-gray-400">· {source}</span>}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Reason</p>
            <p className="mt-1 text-sm text-navy-700">{action.reason}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-400">Estimated Impact</p>
              <p className="mt-1 text-sm font-bold text-emerald-700">{action.estimatedImpact}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-400">AI Confidence</p>
              <p className="mt-1 text-sm font-bold text-navy-900">{action.confidence}%</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-400">Risk Level</p>
              <p className="mt-1 text-sm font-bold capitalize text-navy-900">{action.risk}</p>
            </div>
            {action.affectedCustomers && (
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-400">Affected Customers</p>
                <p className="mt-1 text-sm font-bold text-navy-900">{action.affectedCustomers}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Recommended Execution</p>
            <p className="mt-1 text-sm text-navy-700">
              {action.type === 'revenue_recovery' && 'Send payment recovery links with alternate payment methods to affected customers.'}
              {action.type === 'conversion' && 'Optimize checkout flow by reducing steps and pre-selecting preferred payment method.'}
              {action.type === 'customer_growth' && 'Launch personalized win-back campaign with targeted offers based on purchase history.'}
              {action.type === 'payments' && 'Set UPI as default payment method on mobile checkout with a visual badge.'}
              {action.type === 'manual' && 'Execute the planned workflow manually with appropriate tracking.'}
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-accent-50 p-3">
            <Info className="h-4 w-4 flex-shrink-0 text-accent-600" />
            <p className="text-xs text-accent-700">
              <span className="font-semibold">Simulated Prototype Action:</span> No real payments will be processed. This demonstrates the agentic workflow experience.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};
