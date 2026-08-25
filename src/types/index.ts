export type Priority = 'high' | 'medium' | 'low';
export type InsightCategory = 'revenue' | 'payments' | 'customers' | 'conversion';
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';
export type TransactionStatus = 'success' | 'failed' | 'pending';
export type PaymentMethod = 'UPI' | 'Cards' | 'Net Banking' | 'Wallets';
export type CustomerSegment = 'high_value' | 'returning' | 'at_risk' | 'failed_payment';
export type DateRange = 'today' | '7d' | '30d' | '90d';
export type BusinessId = 'acme' | 'nova' | 'flowmart';
export type ActionType = 'revenue_recovery' | 'conversion' | 'customer_growth' | 'payments' | 'manual';
export type ActionTrigger = 'ai_copilot' | 'ai_insight' | 'ai_recommendation' | 'manual';
export type OpportunityStatus = 'open' | 'in_progress' | 'completed' | 'rejected';
export type PageId =
  | 'overview'
  | 'insights'
  | 'opportunities'
  | 'payments'
  | 'customers'
  | 'copilot'
  | 'actions'
  | 'history'
  | 'settings'
  | 'help';

export interface KpiCard {
  id: string;
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  sublabel: string;
  icon: string;
}

export interface RevenueDataPoint {
  date: string;
  current: number;
  previous: number;
}

export interface PaymentDataPoint {
  date: string;
  success: number;
  failed: number;
}

export interface PaymentMethodData {
  name: PaymentMethod;
  value: number;
  color: string;
}

export interface FailureReasonData {
  reason: string;
  count: number;
  percentage: number;
  color: string;
}

export interface Insight {
  id: string;
  priority: Priority;
  category: InsightCategory;
  title: string;
  whatHappened: string;
  why: string;
  impact: string;
  recommendation: string;
  estimatedImpact: string;
  cta: string;
  actionId?: string;
}

export type OpportunityCategory = 'revenue_recovery' | 'customer_growth' | 'payments' | 'conversion';

export interface Opportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  potentialImpact: string;
  impactValue: number;
  confidence: number;
  priority: Priority;
  recommendedAction: string;
  status: OpportunityStatus;
  problem: string;
  evidence: string;
  aiReasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  actionId?: string;
  supportingMetrics?: { label: string; value: string }[];
  recommendedNextStep?: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  status: TransactionStatus;
  failureReason?: string;
  customer: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  segment: CustomerSegment;
  orders: number;
  lifetimeValue: number;
  lastPurchase: string;
  risk: 'low' | 'medium' | 'high';
  recommendation: string;
  recentActivity: { date: string; action: string; amount?: number }[];
  aiInsight: string;
}

export interface CustomerSegmentData {
  segment: CustomerSegment;
  label: string;
  count: number;
  revenue: string;
  color: string;
  icon: string;
}

export interface ActionItem {
  id: string;
  title: string;
  type: ActionType;
  trigger: ActionTrigger;
  reason: string;
  estimatedImpact: string;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  status: ActionStatus;
  date: string;
  affectedCustomers?: number;
  result?: {
    customersProcessed?: number;
    estimatedRecovered?: string;
    recoveryRate?: number;
    impact?: string;
  };
}

export interface Notification {
  id: string;
  type: 'alert' | 'opportunity' | 'success' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  actionCard?: {
    title: string;
    estimatedImpact: string;
    affectedCustomers?: number;
    confidence: number;
    actionId: string;
  };
  actionButton?: { label: string; target: 'opportunities' | 'actions' };
  customerList?: { name: string; issue: string; amount: string; reason: string; recovery: string }[];
  recommendations?: { rank: number; title: string; priority: string; impact: string }[];
  nextSteps?: string[];
  timestamp: string;
}

export interface Business {
  id: BusinessId;
  name: string;
  industry: string;
}

export interface BusinessData {
  metrics: {
    totalRevenue: string;
    revenueValue: number;
    revenueChange: string;
    successRate: string;
    successRateChange: string;
    failedPayments: number;
    failedPaymentsChange: string;
    revenueAtRisk: string;
    revenueAtRiskChange: string;
    opportunityScore: number;
    opportunityLabel: string;
    totalTransactions: number;
    avgTransactionValue: string;
  };
  revenueSeries: RevenueDataPoint[];
  paymentSeries: PaymentDataPoint[];
  paymentMethods: PaymentMethodData[];
  failureReasons: FailureReasonData[];
  transactions: Transaction[];
  customers: Customer[];
  successRateSeries: { date: string; rate: number }[];
}
