import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  ChevronDown,
  Store,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Info,
  Search,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { businesses } from '@/data/business';
import type { DateRange, BusinessId, Notification } from '@/types';
import { Tooltip } from '@/components/ui/Tooltip';

const dateRanges: { id: DateRange; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
];

const notifIcons = {
  alert: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  opportunity: { icon: TrendingUp, color: 'text-accent-600', bg: 'bg-accent-50' },
  success: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  info: { icon: Info, color: 'text-navy-500', bg: 'bg-navy-50' },
};

export const TopBar = () => {
  const { businessId, setBusinessId, businessName, dateRange, setDateRange, notifications, unreadCount, markNotificationRead, markAllRead, setSidebarOpen } = useApp();
  const [businessOpen, setBusinessOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const businessRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (businessRef.current && !businessRef.current.contains(e.target as Node)) setBusinessOpen(false);
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setDateOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentRange = dateRanges.find((r) => r.id === dateRange);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-navy-600 hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Business Selector */}
        <div ref={businessRef} className="relative">
          <button
            onClick={() => setBusinessOpen(!businessOpen)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-navy-900 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <Store className="h-4 w-4 text-accent-600" />
            <span className="hidden sm:inline">{businessName}</span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${businessOpen ? 'rotate-180' : ''}`} />
          </button>
          {businessOpen && (
            <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-elevated animate-scale-in z-50">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">Select Business</p>
              {businesses.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setBusinessId(b.id as BusinessId);
                    setBusinessOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                    businessId === b.id ? 'bg-accent-50 text-accent-700 font-semibold' : 'text-navy-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.industry}</p>
                  </div>
                  {businessId === b.id && <CheckCircle2 className="h-4 w-4 text-accent-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Selector */}
        <div ref={dateRef} className="relative hidden sm:block">
          <button
            onClick={() => setDateOpen(!dateOpen)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-navy-700 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{currentRange?.label}</span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dateOpen ? 'rotate-180' : ''}`} />
          </button>
          {dateOpen && (
            <div className="absolute left-0 top-full mt-1 w-44 rounded-lg border border-gray-200 bg-white shadow-elevated animate-scale-in z-50">
              {dateRanges.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setDateRange(r.id);
                    setDateOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                    dateRange === r.id ? 'bg-accent-50 text-accent-700 font-semibold' : 'text-navy-700 hover:bg-gray-50'
                  }`}
                >
                  {r.label}
                  {dateRange === r.id && <CheckCircle2 className="h-4 w-4 text-accent-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <Tooltip content="Notifications">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative rounded-lg p-2 text-navy-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </Tooltip>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white shadow-elevated animate-scale-in z-50">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-navy-900">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs font-medium text-accent-600 hover:text-accent-700">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.map((notif: Notification) => {
                  const { icon: Icon, color, bg } = notifIcons[notif.type];
                  return (
                    <button
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left border-b border-gray-50 transition-colors hover:bg-gray-50 ${!notif.read ? 'bg-accent-50/30' : ''}`}
                    >
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${bg}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-navy-900">{notif.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{notif.message}</p>
                        <p className="mt-1 text-[11px] text-gray-400">{notif.time}</p>
                      </div>
                      {!notif.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <Tooltip content="Alex Morgan">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white hover:bg-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1">
            AX
          </button>
        </Tooltip>
      </div>
    </header>
  );
};
