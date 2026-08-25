import { LifeBuoy, BookOpen, Zap, MessageSquare, Mail, ExternalLink } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';

const faqs = [
  {
    q: 'How does PayPilot AI detect revenue leaks?',
    a: 'PayPilot AI analyzes your payment success rates, failure patterns, customer behavior, and conversion trends. It identifies statistically significant anomalies and quantifies their revenue impact.',
  },
  {
    q: 'What happens when I approve an action?',
    a: 'When you approve an action, PayPilot AI simulates the workflow execution. In this prototype, no real financial transactions are processed. In production, the action would trigger the corresponding workflow on your connected payment platform.',
  },
  {
    q: 'How accurate are the AI confidence scores?',
    a: 'Confidence scores are calculated based on historical pattern matching, data quality, and the strength of the statistical signal. Scores above 80% indicate strong evidence-based recommendations.',
  },
  {
    q: 'Can I connect my real Razorpay account?',
    a: 'This is a prototype for the Razorpay AI Builder 2026. The architecture is designed to support real API integration. Production deployment would connect to live payment data via Razorpay APIs.',
  },
  {
    q: 'What is the AI Opportunity Score?',
    a: 'The Opportunity Score (0-100) reflects the overall growth potential of your business based on detected opportunities, recovery possibilities, and optimization areas. Higher scores indicate more actionable growth potential.',
  },
];

export const Help = () => {
  const { setCurrentPage, showToast } = useApp();

  const resources = [
    { icon: BookOpen, title: 'Documentation', desc: 'Read the full product guide and API reference', action: () => showToast('info', 'Documentation', 'Full docs will be available in the production release.') },
    { icon: Zap, title: 'Action Center Guide', desc: 'Learn how to review and approve AI actions', action: () => setCurrentPage('actions') },
    { icon: MessageSquare, title: 'AI Copilot Tips', desc: 'Get the most out of conversational AI analysis', action: () => setCurrentPage('copilot') },
    { icon: Mail, title: 'Contact Support', desc: 'Reach out to our team for assistance', action: () => showToast('info', 'Support contacted', 'Our team will respond within 24 hours.') },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Help & Support</h1>
        <p className="mt-1 text-sm text-gray-500">Get answers and learn how to get the most out of PayPilot AI.</p>
      </div>

      {/* Quick Resources */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {resources.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.title} hover onClick={r.action} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent-50">
                  <Icon className="h-5 w-5 text-accent-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-navy-900">{r.title}</p>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{r.desc}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-navy-600" />
            <CardTitle>Frequently Asked Questions</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-semibold text-navy-900">{faq.q}</p>
              <p className="mt-1.5 text-sm text-gray-600">{faq.a}</p>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Prototype Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardBody>
          <div className="flex items-start gap-3">
            <LifeBuoy className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Prototype Notice</p>
              <p className="mt-1 text-xs text-amber-700">
                This is a prototype for the Razorpay AI Builder 2026 — Track 1: AI Growth & Agentic Commerce.
                All data is simulated. No real payment processing or money movement occurs. The architecture is designed for real API integration in production.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
