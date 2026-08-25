import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { BusinessId, DateRange, ActionItem, Notification, PageId, ActionType, ActionTrigger, Insight, Opportunity, BusinessData } from '@/types';
import { getBusinessData, businesses } from '@/data/business';
import { getInsights, getOpportunities, getActions, getNotifications } from '@/data/insights';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextValue {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;

  businessId: BusinessId;
  businessName: string;
  setBusinessId: (id: BusinessId) => void;

  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;

  actions: ActionItem[];
  createAction: (params: { title: string; type: ActionType; trigger: ActionTrigger; reason: string; estimatedImpact: string; confidence: number; risk: 'low' | 'medium' | 'high'; affectedCustomers?: number; }) => string;
  approveAction: (actionId: string) => void;
  rejectAction: (actionId: string) => void;
  getActionById: (id: string) => ActionItem | undefined;

  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  toasts: Toast[];
  showToast: (type: Toast['type'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  data: BusinessData;
  insights: Insight[];
  opportunities: Opportunity[];
}

const AppContext = createContext<AppContextValue | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

const TODAY_DATE = new Date(2026, 7, 24);

const rangeDays: Record<DateRange, number> = {
  today: 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [businessId, setBusinessId] = useState<BusinessId>('acme');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customActions, setCustomActions] = useState<ActionItem[]>([]);
  const [actionOverrides, setActionOverrides] = useState<Record<string, Partial<ActionItem>>>({});
  const [customNotifications, setCustomNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const businessName = businesses.find((b) => b.id === businessId)?.name ?? 'Acme Store';

  const data = useMemo(() => getBusinessData(businessId, dateRange), [businessId, dateRange]);
  const insights = useMemo(() => getInsights(dateRange), [dateRange]);
  const opportunities = useMemo(() => getOpportunities(dateRange), [dateRange]);
  const baseActions = useMemo(() => getActions(dateRange), [dateRange]);
  const baseNotifications = useMemo(() => getNotifications(dateRange), [dateRange]);

  const actions = useMemo(() => {
    const days = rangeDays[dateRange];
    const cutoff = new Date(TODAY_DATE);
    cutoff.setDate(cutoff.getDate() - days);

    const customInRange = customActions.filter((a) => new Date(a.date) >= cutoff);

    const overriddenBase = baseActions.map((a) => {
      const override = actionOverrides[a.id];
      return override ? { ...a, ...override } as ActionItem : a;
    });

    return [...customInRange, ...overriddenBase];
  }, [customActions, baseActions, actionOverrides, dateRange]);

  const notifications = useMemo(() => {
    return [...customNotifications, ...baseNotifications];
  }, [customNotifications, baseNotifications]);

  const showToast = useCallback((type: Toast['type'], title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const createAction = useCallback((params: {
    title: string;
    type: ActionType;
    trigger: ActionTrigger;
    reason: string;
    estimatedImpact: string;
    confidence: number;
    risk: 'low' | 'medium' | 'high';
    affectedCustomers?: number;
  }) => {
    const id = `act-${Date.now()}`;
    const newAction: ActionItem = {
      id,
      title: params.title,
      type: params.type,
      trigger: params.trigger,
      reason: params.reason,
      estimatedImpact: params.estimatedImpact,
      confidence: params.confidence,
      risk: params.risk,
      status: 'pending',
      date: TODAY_DATE.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      affectedCustomers: params.affectedCustomers,
    };
    setCustomActions((prev) => [newAction, ...prev]);
    return id;
  }, []);

  const approveAction = useCallback((actionId: string) => {
    const applyUpdate = (arr: ActionItem[], update: Partial<ActionItem>) =>
      arr.map((a) => (a.id === actionId ? { ...a, ...update } : a));

    const inProgressUpdate = { status: 'in_progress' as const };
    setCustomActions((prev) => applyUpdate(prev, inProgressUpdate));
    setActionOverrides((prev) => ({ ...prev, [actionId]: { ...(prev[actionId] ?? {}), ...inProgressUpdate } }));

    setTimeout(() => {
      const action = [...customActions, ...baseActions].find((a) => a.id === actionId);
      const recovered = action?.affectedCustomers ? Math.round(action.affectedCustomers * 0.71) : undefined;
      const impactNum = action ? parseInt(action.estimatedImpact.replace(/[^0-9]/g, ''), 10) : 0;
      const recoveredAmount = Math.round(impactNum * 0.71);
      const completedUpdate = {
        status: 'completed' as const,
        result: {
          customersProcessed: recovered,
          estimatedRecovered: `₹${recoveredAmount.toLocaleString('en-IN')}`,
          recoveryRate: 71,
          impact: action?.estimatedImpact,
        },
      };
      setCustomActions((prev) => applyUpdate(prev, completedUpdate));
      setActionOverrides((prev) => ({ ...prev, [actionId]: { ...(prev[actionId] ?? {}), ...completedUpdate } }));
      showToast('success', 'Action approved successfully.', 'The action has been completed and added to Action History.');
    }, 2500);
  }, [showToast, customActions, baseActions]);

  const rejectAction = useCallback((actionId: string) => {
    const rejectedUpdate = { status: 'rejected' as const };
    const applyUpdate = (arr: ActionItem[]) =>
      arr.map((a) => (a.id === actionId ? { ...a, ...rejectedUpdate } : a));
    setCustomActions(applyUpdate);
    setActionOverrides((prev) => ({ ...prev, [actionId]: { ...(prev[actionId] ?? {}), ...rejectedUpdate } }));
    showToast('info', 'Action rejected.', 'The action has been moved to Action History.');
  }, [showToast]);

  const getActionById = useCallback((id: string) => actions.find((a) => a.id === id), [actions]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = useCallback((id: string) => {
    setCustomNotifications((prev) => {
      const exists = prev.some((n) => n.id === id);
      if (exists) return prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      return prev;
    });
    setBaseNotificationRead(id);
  }, []);

  const [baseNotificationReads, setBaseNotificationReads] = useState<Record<string, boolean>>({});
  const setBaseNotificationRead = useCallback((id: string) => {
    setBaseNotificationReads((prev) => ({ ...prev, [id]: true }));
  }, []);

  const markAllRead = useCallback(() => {
    setCustomNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setBaseNotificationReads((prev) => {
      const next: Record<string, boolean> = {};
      notifications.forEach((n) => { next[n.id] = true; });
      return { ...prev, ...next };
    });
  }, [notifications]);

  const notificationsFinal = useMemo(() => {
    return notifications.map((n) => baseNotificationReads[n.id] ? { ...n, read: true } : n);
  }, [notifications, baseNotificationReads]);

  const unreadCountFinal = notificationsFinal.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        businessId,
        businessName,
        setBusinessId,
        dateRange,
        setDateRange,
        actions,
        createAction,
        approveAction,
        rejectAction,
        getActionById,
        notifications: notificationsFinal,
        unreadCount: unreadCountFinal,
        markNotificationRead,
        markAllRead,
        toasts,
        showToast,
        dismissToast,
        sidebarOpen,
        setSidebarOpen,
        data,
        insights,
        opportunities,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
