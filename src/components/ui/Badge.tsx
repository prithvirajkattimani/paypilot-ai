import type { ReactNode } from 'react';
import type { Priority } from '@/types';

const priorityStyles: Record<Priority, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const statusStyles: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'in_progress': 'bg-accent-50 text-accent-700 border-accent-200',
  rejected: 'bg-gray-100 text-gray-600 border-gray-200',
  open: 'bg-accent-50 text-accent-700 border-accent-200',
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${priorityStyles[priority]}`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
    {priority}
  </span>
);

export const StatusBadge = ({ status }: { status: string }) => {
  const style = statusStyles[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  const label = status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}>
      {status === 'in_progress' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500" />}
      {label}
    </span>
  );
};

export const CategoryBadge = ({ category }: { category: string }) => {
  const styles: Record<string, string> = {
    revenue: 'bg-navy-50 text-navy-700 border-navy-200',
    payments: 'bg-accent-50 text-accent-700 border-accent-200',
    customers: 'bg-violet-50 text-violet-700 border-violet-200',
    conversion: 'bg-teal-50 text-teal-700 border-teal-200',
  revenue_recovery: 'bg-accent-50 text-accent-700 border-accent-200',
    customer_growth: 'bg-violet-50 text-violet-700 border-violet-200',
    manual: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const style = styles[category] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  const label = category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
};

export const Badge = ({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }) => {
  const styles = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    primary: 'bg-accent-50 text-accent-700 border-accent-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-navy-50 text-navy-700 border-navy-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};
