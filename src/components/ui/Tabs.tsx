interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export const Tabs = ({ tabs, active, onChange }: TabsProps) => (
  <div className="flex gap-1 border-b border-gray-200 overflow-x-auto scrollbar-thin">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 rounded-t-md ${
          active === tab.id
            ? 'border-accent-600 text-accent-700'
            : 'border-transparent text-gray-500 hover:text-navy-700 hover:border-gray-300'
        }`}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            active === tab.id ? 'bg-accent-100 text-accent-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);
