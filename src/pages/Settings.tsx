import { useState } from 'react';
import { Building2, Sparkles, Bell, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const Settings = () => {
  const { businessId, businessName, showToast } = useApp();
  const [businessName2, setBusinessName2] = useState(businessName);
  const [industry, setIndustry] = useState('D2C Retail');
  const [currency, setCurrency] = useState('INR');
  const [aiRecs, setAiRecs] = useState(true);
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [notifPrefs, setNotifPrefs] = useState(true);

  const handleSave = () => {
    showToast('success', 'Settings saved', 'Your preferences have been updated successfully.');
  };

  const Toggle = ({ checked, onChange, label, description }: { checked: boolean; onChange: () => void; label: string; description: string }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-navy-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 ${
          checked ? 'bg-accent-600' : 'bg-gray-300'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your business profile and AI preferences.</p>
      </div>

      {/* Business Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-navy-600" />
            <CardTitle>Business Profile</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Business Name</label>
            <input
              type="text"
              value={businessName2}
              onChange={(e) => setBusinessName2(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option>E-commerce</option>
              <option>D2C Retail</option>
              <option>Marketplace</option>
              <option>SaaS</option>
              <option>Education</option>
              <option>Healthcare</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
              <option value="GBP">GBP — British Pound (£)</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* AI Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-600" />
            <CardTitle>AI Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="divide-y divide-gray-100">
          <Toggle
            checked={aiRecs}
            onChange={() => setAiRecs(!aiRecs)}
            label="AI Recommendations"
            description="Allow PayPilot AI to generate growth recommendations based on your business data."
          />
          <Toggle
            checked={autoAnalysis}
            onChange={() => setAutoAnalysis(!autoAnalysis)}
            label="Auto-Analysis"
            description="Automatically analyze payment patterns and customer behavior in the background."
          />
          <Toggle
            checked={notifPrefs}
            onChange={() => setNotifPrefs(!notifPrefs)}
            label="Notification Preferences"
            description="Receive alerts for high-priority insights and action status changes."
          />
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => showToast('info', 'Changes discarded', 'Your settings were not saved.')}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>
          <Check className="h-4 w-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
};
