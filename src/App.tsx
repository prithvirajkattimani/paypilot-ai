import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { ToastContainer } from '@/components/ui/Toast';
import { Overview } from '@/pages/Overview';
import { Insights } from '@/pages/Insights';
import { Opportunities } from '@/pages/Opportunities';
import { Payments } from '@/pages/Payments';
import { Customers } from '@/pages/Customers';
import { Copilot } from '@/pages/Copilot';
import { Actions } from '@/pages/Actions';
import { History } from '@/pages/History';
import { Settings } from '@/pages/Settings';
import { Help } from '@/pages/Help';

const PageRouter = () => {
  const { currentPage } = useApp();

  switch (currentPage) {
    case 'overview': return <Overview />;
    case 'insights': return <Insights />;
    case 'opportunities': return <Opportunities />;
    case 'payments': return <Payments />;
    case 'customers': return <Customers />;
    case 'copilot': return <Copilot />;
    case 'actions': return <Actions />;
    case 'history': return <History />;
    case 'settings': return <Settings />;
    case 'help': return <Help />;
    default: return <Overview />;
  }
};

function AppContent() {
  const { currentPage } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-[250px]">
        <TopBar />
        <main key={currentPage} className="p-4 lg:p-6">
          <PageRouter />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
