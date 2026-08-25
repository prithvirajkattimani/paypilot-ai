import type { BusinessData, ChatMessage, Customer, Opportunity, DateRange } from '@/types';

export interface AIResponse {
  text: string;
  actionCard?: ChatMessage['actionCard'];
  actionButton?: { label: string; target: 'opportunities' | 'actions' };
  customerList?: { name: string; issue: string; amount: string; reason: string; recovery: string }[];
  recommendations?: { rank: number; title: string; priority: string; impact: string }[];
  nextSteps?: string[];
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const createMessage = (
  sender: 'user' | 'ai',
  text: string,
  actionCard?: ChatMessage['actionCard']
): ChatMessage => ({
  id: generateId(),
  sender,
  text,
  actionCard,
  timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
});

const rangeLabel: Record<DateRange, string> = {
  today: 'today',
  '7d': 'in the last 7 days',
  '30d': 'in the last 30 days',
  '90d': 'in the last 90 days',
};

const buildFailedPaymentCustomers = (customers: Customer[]) => {
  const failedCustomers = customers.filter((c) => c.segment === 'failed_payment');
  const reasons = ['Insufficient funds', 'Bank decline', 'Timeout', 'Authentication failure'];
  return failedCustomers.slice(0, 5).map((c, i) => ({
    name: c.name,
    issue: 'Payment failed',
    amount: `₹${Math.round(c.lifetimeValue * 0.15).toLocaleString('en-IN')}`,
    reason: reasons[i % reasons.length],
    recovery: `₹${Math.round(c.lifetimeValue * 0.12).toLocaleString('en-IN')}`,
  }));
};

const topRecoveryOpportunity = (opportunities: Opportunity[]) =>
  opportunities.find((o) => o.category === 'revenue_recovery') ?? opportunities[0];

const topGrowthOpportunity = (opportunities: Opportunity[]) =>
  opportunities.find((o) => o.category === 'customer_growth') ?? opportunities[1] ?? opportunities[0];

export const simulateAIResponse = (query: string, data: BusinessData, opportunities: Opportunity[], dateRange: DateRange): AIResponse => {
  const q = query.toLowerCase().trim();
  const m = data.metrics;
  const label = rangeLabel[dateRange];
  const recovery = topRecoveryOpportunity(opportunities);
  const growth = topGrowthOpportunity(opportunities);

  if (q.includes('revenue') && (q.includes('decrease') || q.includes('drop') || q.includes('down') || q.includes('fell'))) {
    return {
      text: `Revenue decreased by 8.4% compared with the previous period. Here's what contributed to the decline ${label}:\n\n• Failed payments: ${m.failedPayments} total (${m.failedPaymentsChange})\n• Insufficient funds is the largest failure reason at ${data.failureReasons[0]?.percentage ?? 35}%\n• Returning customer conversion dropped by 6.4%\n• Estimated revenue at risk: ${m.revenueAtRisk}\n\nRecommended next steps:`,
      nextSteps: [
        `${recovery?.title ?? 'Recover Failed Payments'} (${recovery?.potentialImpact ?? '₹27,335'} potential recovery)`,
        'Improve returning customer recommendations (₹18,000 potential)',
        'Promote higher-performing payment methods (₹11,000 potential)',
      ],
      actionCard: recovery ? {
        title: recovery.title,
        estimatedImpact: recovery.potentialImpact,
        affectedCustomers: recovery.supportingMetrics?.find((s) => s.label.includes('Customers')) ? parseInt(recovery.supportingMetrics.find((s) => s.label.includes('Customers'))!.value.replace(/[^0-9]/g, ''), 10) : undefined,
        confidence: recovery.confidence,
        actionId: recovery.id,
      } : undefined,
    };
  }

  if (q.includes('where') && q.includes('los')) {
    const total = opportunities.reduce((sum, o) => sum + o.impactValue, 0);
    return {
      text: `I identified ${opportunities.length} areas where you're losing revenue ${label}:\n\n${opportunities.slice(0, 4).map((o, i) => `• ${o.title}: ${o.potentialImpact} potential`).join('\n')}\n\nTotal identified revenue potential: ₹${(total / 100000).toFixed(2)}L across ${opportunities.length} opportunities.`,
      actionButton: { label: 'View Opportunities', target: 'opportunities' },
    };
  }

  if (q.includes('what should i do') || q.includes('what should i fix') || q.includes('priority') || q.includes('first')) {
    const sorted = [...opportunities].sort((a, b) => b.impactValue - a.impactValue).slice(0, 4);
    return {
      text: `Here are my ranked recommendations based on impact and confidence ${label}:`,
      recommendations: sorted.map((o, i) => ({
        rank: i + 1,
        title: o.title,
        priority: o.priority === 'high' ? 'High' : o.priority === 'medium' ? 'Medium' : 'Low',
        impact: o.potentialImpact,
      })),
      actionCard: sorted[0] ? {
        title: sorted[0].title,
        estimatedImpact: sorted[0].potentialImpact,
        affectedCustomers: sorted[0].supportingMetrics?.find((s) => s.label.includes('Customers')) ? parseInt(sorted[0].supportingMetrics.find((s) => s.label.includes('Customers'))!.value.replace(/[^0-9]/g, ''), 10) : undefined,
        confidence: sorted[0].confidence,
        actionId: sorted[0].id,
      } : undefined,
    };
  }

  if (q.includes('customer') && q.includes('fail')) {
    return {
      text: `I found ${m.failedPayments} customers affected by failed payments ${label}. Insufficient funds is the primary failure reason at ${data.failureReasons[0]?.percentage ?? 35}%. Here are the most impacted customers:`,
      customerList: buildFailedPaymentCustomers(data.customers),
      actionCard: recovery ? {
        title: recovery.title,
        estimatedImpact: recovery.potentialImpact,
        affectedCustomers: recovery.supportingMetrics?.find((s) => s.label.includes('Customers')) ? parseInt(recovery.supportingMetrics.find((s) => s.label.includes('Customers'))!.value.replace(/[^0-9]/g, ''), 10) : undefined,
        confidence: recovery.confidence,
        actionId: recovery.id,
      } : undefined,
    };
  }

  if (q.includes('customer')) {
    const segments = ['high_value', 'returning', 'at_risk', 'failed_payment'] as const;
    const counts: Record<string, { count: number; revenue: string }> = {
      high_value: { count: 1248, revenue: '₹6.4L' },
      returning: { count: 3820, revenue: '14.2% repeat rate' },
      at_risk: { count: 642, revenue: '₹82K potential' },
      failed_payment: { count: m.failedPayments, revenue: recovery?.potentialImpact ?? '₹27,335' },
    };
    return {
      text: `Your customer base breaks into 4 segments ${label}:\n\n• High Value: ${counts.high_value.count} customers generating ${counts.high_value.revenue}\n• Returning: ${counts.returning.count} customers with a ${counts.returning.revenue}\n• At Risk: ${counts.at_risk.count} customers with ${counts.at_risk.revenue} revenue at stake\n• Failed Payment: ${counts.failed_payment.count} customers with a ${counts.failed_payment.revenue} recovery opportunity\n\nI'd recommend focusing on the failed payment segment first — they have the clearest recovery path.`,
      actionCard: recovery ? {
        title: recovery.title,
        estimatedImpact: recovery.potentialImpact,
        affectedCustomers: recovery.supportingMetrics?.find((s) => s.label.includes('Customers')) ? parseInt(recovery.supportingMetrics.find((s) => s.label.includes('Customers'))!.value.replace(/[^0-9]/g, ''), 10) : undefined,
        confidence: recovery.confidence,
        actionId: recovery.id,
      } : undefined,
    };
  }

  if (q.includes('growth') || q.includes('highest') || q.includes('opportunity') || q.includes('highest-value')) {
    return {
      text: `Your highest-value growth opportunity ${label} is:\n\n${growth?.title ?? 'At-Risk Customer Recovery'}\nEstimated Impact: ${growth?.potentialImpact ?? '₹38,500'}\nConfidence: ${growth?.confidence ?? 79}%\nPriority: ${growth?.priority === 'high' ? 'High' : 'Medium'}\n\n${growth?.evidence ?? '642 at-risk customers have not purchased in 45+ days. A personalized win-back campaign can recover an estimated ₹38,500.'}`,
      actionCard: growth ? {
        title: growth.title,
        estimatedImpact: growth.potentialImpact,
        affectedCustomers: growth.supportingMetrics?.find((s) => s.label.includes('Customers')) ? parseInt(growth.supportingMetrics.find((s) => s.label.includes('Customers'))!.value.replace(/[^0-9]/g, ''), 10) : undefined,
        confidence: growth.confidence,
        actionId: growth.id,
      } : undefined,
    };
  }

  if (q.includes('payment') && (q.includes('fail') || q.includes('issue') || q.includes('problem'))) {
    return {
      text: `Payment failures ${label}: ${m.failedPayments} total failed transactions. The primary causes are:\n\n${data.failureReasons.slice(0, 4).map((r) => `• ${r.reason}: ${r.percentage}%`).join('\n')}\n\nEstimated recoverable revenue: ${recovery?.potentialImpact ?? '₹27,335'}.`,
      actionCard: recovery ? {
        title: recovery.title,
        estimatedImpact: recovery.potentialImpact,
        affectedCustomers: recovery.supportingMetrics?.find((s) => s.label.includes('Customers')) ? parseInt(recovery.supportingMetrics.find((s) => s.label.includes('Customers'))!.value.replace(/[^0-9]/g, ''), 10) : undefined,
        confidence: recovery.confidence,
        actionId: recovery.id,
      } : undefined,
    };
  }

  if (q.includes('success rate') || q.includes('performance')) {
    return {
      text: `Your overall payment success rate is ${m.successRate} ${label}, ${m.successRateChange} from the previous period. UPI leads with 96.8% success, followed by Cards at 88.6%. The UPI performance advantage is 8.2%. Total transactions: ${m.totalTransactions.toLocaleString('en-IN')}.`,
    };
  }

  if (q.includes('revenue') && (q.includes('increase') || q.includes('grow') || q.includes('up') || q.includes('trend'))) {
    return {
      text: `Revenue is trending up ${m.revenueChange} compared to the previous period. Total revenue stands at ${m.totalRevenue} ${label}. The growth is driven by an 8.2% increase in average order value, partly from the product bundling feature launched on Aug 5. However, payment failures are creating a ${recovery?.potentialImpact ?? '₹27,335'} drag on potential revenue.`,
    };
  }

  if (q.includes('hello') || q.includes('hi ') || q === 'hi' || q.includes('hey')) {
    return {
      text: `Hello! I'm PayPilot Copilot. I can analyze your business data and recommend actions. Try asking about revenue trends, payment failures, customer segments, or growth opportunities. You can also ask "What should I fix first?" for a prioritized recommendation.`,
    };
  }

  return {
    text: `I can analyze your business across these areas:\n\n• Payments — success rates, failure patterns, method performance\n• Customers — segments, at-risk detection, recovery opportunities\n• Revenue leakage — where you're losing money and how to recover it\n• Growth opportunities — AI-detected actions to accelerate revenue\n\nTry asking "Where am I losing revenue?" or "What should I fix first?" to get started.`,
  };
};
