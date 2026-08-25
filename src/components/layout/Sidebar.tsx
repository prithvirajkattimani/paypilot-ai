import {
  LayoutDashboard,
  Sparkles,
  Target,
  CreditCard,
  Users,
  MessageSquare,
  Zap,
  History,
  Settings,
  LifeBuoy,
  Bot,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { PageId } from '@/types';

interface NavItem {
  id: PageId;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

export const Sidebar = () => {
  const { currentPage, setCurrentPage, actions, setSidebarOpen } = useApp();

  const pendingCount = actions.filter((a) => a.status === 'pending').length;

  const mainNav: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'insights', label: 'AI Insights', icon: Sparkles },
    { id: 'opportunities', label: 'Opportunities', icon: Target },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'copilot', label: 'AI Copilot', icon: MessageSquare },
    { id: 'actions', label: 'Actions', icon: Zap, badge: pendingCount },
    { id: 'history', label: 'History', icon: History },
  ];

  const bottomNav: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: LifeBuoy },
  ];

  const handleNav = (id: PageId) => {
    setCurrentPage(id);
    setSidebarOpen(false);
  };

  return (
    <>
      {useApp().sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-navy-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-[250px] flex-shrink-0 transform border-r border-gray-200 bg-navy-950 transition-transform duration-300 lg:translate-x-0 ${
          useApp().sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-navy-800/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-600 shadow-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">PAYPILOT AI</h1>
              <p className="text-[11px] text-navy-300 font-medium">AI Revenue Growth</p>
            </div>
          </div>

          {/* Main Nav */}
          <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
            <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy-400">Menu</p>
            <ul className="space-y-0.5">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNav(item.id)}
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-inset ${
                        isActive
                          ? 'bg-accent-600 text-white shadow-md'
                          : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-white' : 'text-navy-300 group-hover:text-white'}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-accent-600 text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="px-3 py-1.5 mt-4 text-[11px] font-semibold uppercase tracking-wider text-navy-400">System</p>
            <ul className="space-y-0.5">
              {bottomNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNav(item.id)}
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-inset ${
                        isActive
                          ? 'bg-accent-600 text-white shadow-md'
                          : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-white' : 'text-navy-300 group-hover:text-white'}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-navy-800/50 px-4 py-3">
            <div className="flex items-center gap-2 rounded-lg bg-navy-900 px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-600 text-xs font-bold text-white">
                AX
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">Alex Morgan</p>
                <p className="text-[11px] text-navy-300 truncate">alex@acmestore.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
