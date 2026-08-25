import type { BusinessData, BusinessId, TransactionStatus, Transaction, Customer, RevenueDataPoint, PaymentDataPoint, PaymentMethodData, FailureReasonData, DateRange } from '@/types';

const TODAY = new Date(2026, 7, 24);

const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fmtDateYear = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const dayOffset = (offset: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - offset);
  return d;
};

const rangeDays: Record<DateRange, number> = {
  today: 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const seedRand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const generateRevenueSeries = (base: number, variance: number, days: number, seed: number): RevenueDataPoint[] => {
  const rand = seedRand(seed);
  const series: RevenueDataPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = dayOffset(i);
    const wave = Math.sin((days - i) / 5) * variance;
    const trend = ((days - i) * variance) / (days * 2.5);
    const noise = (rand() - 0.5) * variance * 0.4;
    series.push({
      date: fmtDate(d),
      current: Math.round(base + wave + trend + noise),
      previous: Math.round(base * 0.88 + wave * 0.5 + noise * 0.6),
    });
  }
  return series;
};

const generatePaymentSeries = (base: number, days: number, seed: number): PaymentDataPoint[] => {
  const rand = seedRand(seed);
  const series: PaymentDataPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = dayOffset(i);
    const wave = Math.sin((days - i) / 4) * 30;
    const success = Math.round(base + wave + (rand() - 0.5) * 40);
    const failed = Math.round(base * 0.06 + Math.abs(Math.sin((days - i) / 3)) * 30 + (rand() - 0.5) * 10);
    series.push({ date: fmtDate(d), success, failed });
  }
  return series;
};

const generateSuccessRateSeries = (base: number, days: number, seed: number) => {
  const rand = seedRand(seed);
  const series: { date: string; rate: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = dayOffset(i);
    const wave = Math.sin((days - i) / 6) * 2;
    const noise = (rand() - 0.5) * 1.5;
    series.push({ date: fmtDate(d), rate: Math.round((base + wave + noise) * 10) / 10 });
  }
  return series;
};

const customerNames = [
  'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy', 'Vikram Singh',
  'Ananya Iyer', 'Arjun Nair', 'Kavya Gupta', 'Rohan Mehta', 'Divya Joshi',
  'Karthik Rao', 'Meera Krishnan', 'Sanjay Verma', 'Pooja Bhat', 'Nikhil Desai',
  'Shreya Kapoor', 'Aditya Jain', 'Tanvi Shah', 'Manish Agarwal', 'Ritu Malhotra',
  'Saurabh Tiwari', 'Nisha Pillai', 'Gaurav Saxena', 'Ishita Bose', 'Rajat Khanna',
  'Lakshmi Menon', 'Devesh Chopra', 'Aarti Rangan', 'Yash Bhardwaj', 'Sonia Duggal',
  'Harish Pandey', 'Neelima Das', 'Omar Sheikh', 'Farah Qureshi', 'Prateek Mathur',
  'Rashmi Nair', 'Vinod Kothari', 'Trisha Ghosh', 'Ashok Pillai', 'Bhavna Chauhan',
  'Mohit Sehgal', 'Charu Arora', 'Naveen Luthra', 'Siddhi Kapoor', 'Piyush Tandon',
  'Renu Bhardwaj', 'Akash Mahajan', 'Jyoti Srinivas', 'Varun Kaul', 'Madhuri Nimbkar',
];

const generateTransactions = (count: number, baseAmount: number, days: number, seed: number): Transaction[] => {
  const rand = seedRand(seed);
  const methods = ['UPI', 'Cards', 'Net Banking', 'Wallets'] as const;
  const failureReasons = ['Insufficient funds', 'Bank decline', 'Timeout', 'Authentication failure', 'Other'];
  const transactions: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    const isFailed = rand() < 0.06;
    const isPending = !isFailed && rand() < 0.02;
    const status: TransactionStatus = isFailed ? 'failed' : isPending ? 'pending' : 'success';
    const dayIdx = Math.floor(rand() * days);
    const d = dayOffset(dayIdx);
    const amount = Math.round((rand() * baseAmount + 200) * 100) / 100;
    const method = methods[Math.floor(rand() * methods.length)];
    transactions.push({
      id: `pay_${String(100000 + i).padStart(6, '0')}`,
      date: fmtDateYear(d),
      amount,
      method,
      status,
      failureReason: isFailed ? failureReasons[Math.floor(rand() * failureReasons.length)] : undefined,
      customer: customerNames[Math.floor(rand() * customerNames.length)],
    });
  }
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const customerData = [
  { name: 'Rahul Sharma', email: 'rahul.s@email.com', segment: 'high_value', orders: 47, ltv: 84500, risk: 'low' },
  { name: 'Priya Patel', email: 'priya.p@email.com', segment: 'high_value', orders: 39, ltv: 72300, risk: 'low' },
  { name: 'Amit Kumar', email: 'amit.k@email.com', segment: 'high_value', orders: 52, ltv: 91200, risk: 'low' },
  { name: 'Sneha Reddy', email: 'sneha.r@email.com', segment: 'returning', orders: 18, ltv: 24800, risk: 'low' },
  { name: 'Vikram Singh', email: 'vikram.s@email.com', segment: 'returning', orders: 22, ltv: 31200, risk: 'low' },
  { name: 'Ananya Iyer', email: 'ananya.i@email.com', segment: 'returning', orders: 15, ltv: 19600, risk: 'low' },
  { name: 'Arjun Nair', email: 'arjun.n@email.com', segment: 'at_risk', orders: 8, ltv: 14200, risk: 'high' },
  { name: 'Kavya Gupta', email: 'kavya.g@email.com', segment: 'at_risk', orders: 6, ltv: 11800, risk: 'high' },
  { name: 'Rohan Mehta', email: 'rohan.m@email.com', segment: 'at_risk', orders: 4, ltv: 8400, risk: 'high' },
  { name: 'Divya Joshi', email: 'divya.j@email.com', segment: 'failed_payment', orders: 12, ltv: 18600, risk: 'medium' },
  { name: 'Karthik Rao', email: 'karthik.r@email.com', segment: 'failed_payment', orders: 9, ltv: 14200, risk: 'medium' },
  { name: 'Meera Krishnan', email: 'meera.k@email.com', segment: 'failed_payment', orders: 7, ltv: 11200, risk: 'medium' },
  { name: 'Sanjay Verma', email: 'sanjay.v@email.com', segment: 'high_value', orders: 35, ltv: 68900, risk: 'low' },
  { name: 'Pooja Bhat', email: 'pooja.b@email.com', segment: 'returning', orders: 19, ltv: 27400, risk: 'low' },
  { name: 'Nikhil Desai', email: 'nikhil.d@email.com', segment: 'at_risk', orders: 5, ltv: 9200, risk: 'high' },
  { name: 'Shreya Kapoor', email: 'shreya.k@email.com', segment: 'high_value', orders: 41, ltv: 78300, risk: 'low' },
  { name: 'Aditya Jain', email: 'aditya.j@email.com', segment: 'returning', orders: 24, ltv: 35600, risk: 'low' },
  { name: 'Tanvi Shah', email: 'tanvi.s@email.com', segment: 'failed_payment', orders: 11, ltv: 16400, risk: 'medium' },
  { name: 'Manish Agarwal', email: 'manish.a@email.com', segment: 'high_value', orders: 44, ltv: 82100, risk: 'low' },
  { name: 'Ritu Malhotra', email: 'ritu.m@email.com', segment: 'returning', orders: 16, ltv: 22800, risk: 'low' },
];

const recommendations: Record<string, string> = {
  high_value: 'Offer VIP loyalty perks and early access to new products.',
  returning: 'Send personalized re-engagement campaign with 10% discount.',
  at_risk: 'Trigger win-back flow with personalized offer within 48 hours.',
  failed_payment: 'Send payment recovery link with alternate payment method.',
};

const insights: Record<string, string> = {
  high_value: 'Top 5% revenue contributor. Consistent monthly purchases with growing order value.',
  returning: 'Strong repeat purchase pattern. 14% increase in order frequency this quarter.',
  at_risk: 'No purchases in 45 days. Previously active customer showing churn signals.',
  failed_payment: 'Recent payment failures detected. High likelihood of successful recovery with alternate method.',
};

const generateCustomers = (days: number, seed: number): Customer[] => {
  const rand = seedRand(seed);
  return customerData.map((c, i) => {
    const lastPurchaseDay = Math.floor(rand() * Math.min(days, 25)) + 1;
    const activityDays = [
      Math.min(lastPurchaseDay, days - 2),
      Math.min(lastPurchaseDay + 7, days - 1),
      Math.min(lastPurchaseDay + 14, days),
      Math.min(lastPurchaseDay + 21, days),
    ].map((dd) => Math.max(0, Math.min(dd, days - 1)));
    return {
      id: `cust_${String(i + 1).padStart(4, '0')}`,
      name: c.name,
      email: c.email,
      segment: c.segment as any,
      orders: c.orders,
      lifetimeValue: c.ltv,
      lastPurchase: fmtDateYear(dayOffset(activityDays[0])),
      risk: c.risk as any,
      recommendation: recommendations[c.segment],
      aiInsight: insights[c.segment],
      recentActivity: [
        { date: fmtDateYear(dayOffset(activityDays[0])), action: c.segment === 'failed_payment' ? 'Payment failed' : 'Purchase completed', amount: Math.round(rand() * 3000 + 500) },
        { date: fmtDateYear(dayOffset(activityDays[1])), action: 'Browsed products' },
        { date: fmtDateYear(dayOffset(activityDays[2])), action: 'Purchase completed', amount: Math.round(rand() * 3000 + 500) },
        { date: fmtDateYear(dayOffset(activityDays[3])), action: 'Added to cart' },
      ],
    };
  });
};

interface RangeConfig {
  revenueBase: number;
  revenueVariance: number;
  paymentBase: number;
  successRate: number;
  successRateChange: string;
  revenueChange: string;
  failedPayments: number;
  failedPaymentsChange: string;
  revenueAtRisk: string;
  revenueAtRiskChange: string;
  opportunityScore: number;
  opportunityLabel: string;
  totalTransactions: number;
  avgTransactionValue: string;
  totalRevenue: string;
  revenueValue: number;
  paymentMethods: PaymentMethodData[];
  failureReasons: FailureReasonData[];
  txnCount: number;
  txnBaseAmount: number;
}

const businessConfigs: Record<BusinessId, { name: string; industry: string; ranges: Record<DateRange, RangeConfig> }> = {
  acme: {
    name: 'Acme Store',
    industry: 'E-commerce',
    ranges: {
      today: {
        revenueBase: 62000, revenueVariance: 3000, paymentBase: 240,
        successRate: '94.2%', successRateChange: '+2.4%',
        revenueChange: '+12.8%', failedPayments: 14, failedPaymentsChange: '-8.6%',
        revenueAtRisk: '₹4,200', revenueAtRiskChange: '+6.2%',
        opportunityScore: 82, opportunityLabel: 'High growth potential',
        totalTransactions: 248, avgTransactionValue: '₹2,568',
        totalRevenue: '₹62,400', revenueValue: 62400,
        paymentMethods: [
          { name: 'UPI', value: 44, color: '#0b5cff' },
          { name: 'Cards', value: 29, color: '#10b981' },
          { name: 'Net Banking', value: 17, color: '#f59e0b' },
          { name: 'Wallets', value: 10, color: '#8b5cf6' },
        ],
        failureReasons: [
          { reason: 'Insufficient funds', count: 5, percentage: 36, color: '#ef4444' },
          { reason: 'Bank decline', count: 3, percentage: 21, color: '#f59e0b' },
          { reason: 'Timeout', count: 3, percentage: 21, color: '#8b5cf6' },
          { reason: 'Authentication failure', count: 2, percentage: 14, color: '#0b5cff' },
          { reason: 'Other', count: 1, percentage: 8, color: '#64748b' },
        ],
        txnCount: 12, txnBaseAmount: 4000,
      },
      '7d': {
        revenueBase: 62000, revenueVariance: 5000, paymentBase: 240,
        successRate: '94.5%', successRateChange: '+2.1%',
        revenueChange: '+10.2%', failedPayments: 96, failedPaymentsChange: '-5.4%',
        revenueAtRisk: '₹28,400', revenueAtRiskChange: '+4.1%',
        opportunityScore: 80, opportunityLabel: 'High growth potential',
        totalTransactions: 1720, avgTransactionValue: '₹2,568',
        totalRevenue: '₹4.42L', revenueValue: 442000,
        paymentMethods: [
          { name: 'UPI', value: 43, color: '#0b5cff' },
          { name: 'Cards', value: 30, color: '#10b981' },
          { name: 'Net Banking', value: 18, color: '#f59e0b' },
          { name: 'Wallets', value: 9, color: '#8b5cf6' },
        ],
        failureReasons: [
          { reason: 'Insufficient funds', count: 34, percentage: 35, color: '#ef4444' },
          { reason: 'Bank decline', count: 22, percentage: 23, color: '#f59e0b' },
          { reason: 'Timeout', count: 17, percentage: 18, color: '#8b5cf6' },
          { reason: 'Authentication failure', count: 14, percentage: 14, color: '#0b5cff' },
          { reason: 'Other', count: 9, percentage: 10, color: '#64748b' },
        ],
        txnCount: 28, txnBaseAmount: 4000,
      },
      '30d': {
        revenueBase: 62000, revenueVariance: 8000, paymentBase: 240,
        successRate: '94.2%', successRateChange: '+2.4%',
        revenueChange: '+12.8%', failedPayments: 428, failedPaymentsChange: '-8.6%',
        revenueAtRisk: '₹1.24L', revenueAtRiskChange: '+6.2%',
        opportunityScore: 82, opportunityLabel: 'High growth potential',
        totalTransactions: 7240, avgTransactionValue: '₹2,568',
        totalRevenue: '₹18.6L', revenueValue: 1860000,
        paymentMethods: [
          { name: 'UPI', value: 42, color: '#0b5cff' },
          { name: 'Cards', value: 31, color: '#10b981' },
          { name: 'Net Banking', value: 18, color: '#f59e0b' },
          { name: 'Wallets', value: 9, color: '#8b5cf6' },
        ],
        failureReasons: [
          { reason: 'Insufficient funds', count: 150, percentage: 35, color: '#ef4444' },
          { reason: 'Bank decline', count: 98, percentage: 23, color: '#f59e0b' },
          { reason: 'Timeout', count: 76, percentage: 18, color: '#8b5cf6' },
          { reason: 'Authentication failure', count: 60, percentage: 14, color: '#0b5cff' },
          { reason: 'Other', count: 44, percentage: 10, color: '#64748b' },
        ],
        txnCount: 60, txnBaseAmount: 4000,
      },
      '90d': {
        revenueBase: 62000, revenueVariance: 11000, paymentBase: 240,
        successRate: '93.8%', successRateChange: '+1.8%',
        revenueChange: '+15.4%', failedPayments: 1284, failedPaymentsChange: '-12.2%',
        revenueAtRisk: '₹3.72L', revenueAtRiskChange: '+8.4%',
        opportunityScore: 85, opportunityLabel: 'High growth potential',
        totalTransactions: 21720, avgTransactionValue: '₹2,568',
        totalRevenue: '₹55.8L', revenueValue: 5580000,
        paymentMethods: [
          { name: 'UPI', value: 41, color: '#0b5cff' },
          { name: 'Cards', value: 32, color: '#10b981' },
          { name: 'Net Banking', value: 17, color: '#f59e0b' },
          { name: 'Wallets', value: 10, color: '#8b5cf6' },
        ],
        failureReasons: [
          { reason: 'Insufficient funds', count: 450, percentage: 35, color: '#ef4444' },
          { reason: 'Bank decline', count: 295, percentage: 23, color: '#f59e0b' },
          { reason: 'Timeout', count: 231, percentage: 18, color: '#8b5cf6' },
          { reason: 'Authentication failure', count: 180, percentage: 14, color: '#0b5cff' },
          { reason: 'Other', count: 128, percentage: 10, color: '#64748b' },
        ],
        txnCount: 120, txnBaseAmount: 4000,
      },
    },
  },
  nova: {
    name: 'Nova Commerce',
    industry: 'D2C Retail',
    ranges: {
      today: {
        revenueBase: 41000, revenueVariance: 2200, paymentBase: 170,
        successRate: '91.8%', successRateChange: '+1.2%',
        revenueChange: '+8.4%', failedPayments: 11, failedPaymentsChange: '+3.2%',
        revenueAtRisk: '₹3,300', revenueAtRiskChange: '+4.1%',
        opportunityScore: 74, opportunityLabel: 'Moderate growth potential',
        totalTransactions: 178, avgTransactionValue: '₹2,393',
        totalRevenue: '₹41,200', revenueValue: 41200,
        paymentMethods: [
          { name: 'UPI', value: 40, color: '#0b5cff' },
          { name: 'Cards', value: 33, color: '#10b981' },
          { name: 'Net Banking', value: 15, color: '#f59e0b' },
          { name: 'Wallets', value: 12, color: '#8b5cf6' },
        ],
        failureReasons: [
          { reason: 'Insufficient funds', count: 4, percentage: 36, color: '#ef4444' },
          { reason: 'Bank decline', count: 3, percentage: 27, color: '#f59e0b' },
          { reason: 'Timeout', count: 2, percentage: 18, color: '#8b5cf6' },
          { reason: 'Authentication failure', count: 1, percentage: 9, color: '#0b5cff' },
          { reason: 'Other', count: 1, percentage: 10, color: '#64748b' },
        ],
        txnCount: 10, txnBaseAmount: 3500,
      },
      '7d': {
        revenueBase: 41000, revenueVariance: 3800, paymentBase: 170,
        successRate: '92.1%', successRateChange: '+0.9%',
        revenueChange: '+7.2%', failedPayments: 72, failedPaymentsChange: '+2.1%',
        revenueAtRisk: '₹22,600', revenueAtRiskChange: '+3.2%',
        opportunityScore: 73, opportunityLabel: 'Moderate growth potential',
        totalTransactions: 1240, avgTransactionValue: '₹2,393',
        totalRevenue: '₹2.94L', revenueValue: 294000,
        paymentMethods: [
          { name: 'UPI', value: 39, color: '#0b5cff' },
          { name: 'Cards', value: 34, color: '#10b981' },
          { name: 'Net Banking', value: 15, color: '#f59e0b' },
          { name: 'Wallets', value: 12, color: '#8b5cf6' },
        ],
        failureReasons: [
          { reason: 'Insufficient funds', count: 25, percentage: 35, color: '#ef4444' },
          { reason: 'Bank decline', count: 17, percentage: 23, color: '#f59e0b' },
          { reason: 'Timeout', count: 12, percentage: 17, color: '#8b5cf6' },
          { reason: 'Authentication failure', count: 11, percentage: 15, color: '#0b5cff' },
          { reason: 'Other', count: 7, percentage: 10, color: '#64748b' },
        ],
        txnCount: 24, txnBaseAmount: 3500,
      },
      '30d': {
        revenueBase: 41000, revenueVariance: 6000, paymentBase: 170,
        successRate: '91.8%', successRateChange: '+1.2%',
        revenueChange: '+8.4%', failedPayments: 312, failedPaymentsChange: '+3.2%',
        revenueAtRisk: '₹98K', revenueAtRiskChange: '+4.1%',
        opportunityScore: 74, opportunityLabel: 'Moderate growth potential',
        totalTransactions: 5180, avgTransactionValue: '₹2,393',
        totalRevenue: '₹12.4L', revenueValue: 1240000,
        paymentMethods: [
          { name: 'UPI', value: 38, color: '#0b5cff' },
          { name: 'Cards', value: 35, color: '#10b981' },
          { name: 'Net Banking', value: 15, color: '#f59e0b' },
          { name: 'Wallets', value: 12, color: '#8b5cf6' },
        ],
        failureReasons: [
          { reason: 'Insufficient funds', count: 108, percentage: 35, color: '#ef4444' },
          { reason: 'Bank decline', count: 72, percentage: 23, color: '#f59e0b' },
          { reason: 'Timeout', count: 54, percentage: 17, color: '#8b5cf6' },
          { reason: 'Authentication failure', count: 48, percentage: 15, color: '#0b5cff' },
          { reason: 'Other', count: 30, percentage: 10, color: '#64748b' },
        ],
        txnCount: 50, txnBaseAmount: 3500,
      },
      '90d': {
        revenueBase: 41000, revenueVariance: 8500, paymentBase: 170,
        successRate: '91.5%', successRateChange: '+0.8%',
        revenueChange: '+10.1%', failedPayments: 936, failedPaymentsChange: '+5.4%',
        revenueAtRisk: '₹2.94L', revenueAtRiskChange: '+6.2%',
        opportunityScore: 76, opportunityLabel: 'Moderate growth potential',
        totalTransactions: 15540, avgTransactionValue: '₹2,393',
        totalRevenue: '₹37.2L', revenueValue: 3720000,
        paymentMethods: [
          { name: 'UPI', value: 37, color: '#0b5cff' },
          { name: 'Cards', value: 36, color: '#10b981' },
          { name: 'Net Banking', value: 14, color: '#f59e0b' },
          { name: 'Wallets', value: 13, color: '#8b5cf6' },
        ],
        failureReasons: [
          { reason: 'Insufficient funds', count: 328, percentage: 35, color: '#ef4444' },
          { reason: 'Bank decline', count: 215, percentage: 23, color: '#f59e0b' },
          { reason: 'Timeout', count: 159, percentage: 17, color: '#8b5cf6' },
          { reason: 'Authentication failure', count: 141, percentage: 15, color: '#0b5cff' },
          { reason: 'Other', count: 93, percentage: 10, color: '#64748b' },
        ],
        txnCount: 100, txnBaseAmount: 3500,
      },
    },
  },
  flowmart: {
    name: 'FlowMart',
    industry: 'Marketplace',
    ranges: {
      today: {
        revenueBase: 81000, revenueVariance: 3800, paymentBase: 310,
        successRate: '96.1%', successRateChange: '+3.1%',
        revenueChange: '+15.6%', failedPayments: 6, failedPaymentsChange: '-12.4%',
        revenueAtRisk: '₹2,400', revenueAtRiskChange: '-2.8%',
        opportunityScore: 92, opportunityLabel: 'Very high growth potential',
        totalTransactions: 322, avgTransactionValue: '₹2,568',
        totalRevenue: '₹81,200', revenueValue: 81200,
        paymentMethods: [
          { name: 'UPI', value: 50, color: '#0b5cff' },
          { name: 'Cards', value: 26, color: '#10b981' },
          { name: 'Net Banking', value: 16, color: '#f59e0b' },
          { name: 'Wallets', value: 8, color: '#8b5cf6' },
        ],
        failureReasons: [
          { reason: 'Insufficient funds', count: 2, percentage: 33, color: '#ef4444' },
          { reason: 'Bank decline', count: 1, percentage: 17, color: '#f59e0b' },
          { reason: 'Timeout', count: 1, percentage: 17, color: '#8b5cf6' },
          { reason: 'Authentication failure', count: 1, percentage: 17, color: '#0b5cff' },
          { reason: 'Other', count: 1, percentage: 16, color: '#64748b' },
        ],
        txnCount: 14, txnBaseAmount: 5000,
      },
      '7d': {
        revenueBase: 81000, revenueVariance: 6000, paymentBase: 310,
        successRate: '96.3%', successRateChange: '+2.8%',
        revenueChange: '+14.1%', failedPayments: 42, failedPaymentsChange: '-10.2%',
        revenueAtRisk: '₹16,800', revenueAtRiskChange: '-3.4%',
        opportunityScore: 91, opportunityLabel: 'Very high growth potential',
        totalTransactions: 2254, avgTransactionValue: '₹2,568',
        totalRevenue: '₹5.74L', revenueValue: 574000,
        paymentMethods: [
          { name: 'UPI', value: 49, color: '#0b5cff' },
          { name: 'Cards', value: 27, color: '#10b981' },
          { name: 'Net Banking', value: 16, color: '#f59e0b' },
          { name: 'Wallets', value: 8, color: '#8b5cf6' },
        ],
        failureReasons: [
          { reason: 'Insufficient funds', count: 14, percentage: 33, color: '#ef4444' },
          { reason: 'Bank decline', count: 10, percentage: 24, color: '#f59e0b' },
          { reason: 'Timeout', count: 8, percentage: 19, color: '#8b5cf6' },
          { reason: 'Authentication failure', count: 6, percentage: 14, color: '#0b5cff' },
          { reason: 'Other', count: 4, percentage: 10, color: '#64748b' },
        ],
        txnCount: 30, txnBaseAmount: 5000,
      },
      '30d': {
        revenueBase: 81000, revenueVariance: 10000, paymentBase: 310,
        successRate: '96.1%', successRateChange: '+3.1%',
        revenueChange: '+15.6%', failedPayments: 186, failedPaymentsChange: '-12.4%',
        revenueAtRisk: '₹72K', revenueAtRiskChange: '-2.8%',
        opportunityScore: 92, opportunityLabel: 'Very high growth potential',
        totalTransactions: 9420, avgTransactionValue: '₹2,568',
        totalRevenue: '₹24.2L', revenueValue: 2420000,
        paymentMethods: [
          { name: 'UPI', value: 48, color: '#0b5cff' },
          { name: 'Cards', value: 28, color: '#10b981' },
          { name: 'Net Banking', value: 16, color: '#f59e0b' },
          { name: 'Wallets', value: 8, color: '#8b5cf6' },
        ],
        failureReasons: [
          { reason: 'Insufficient funds', count: 62, percentage: 33, color: '#ef4444' },
          { reason: 'Bank decline', count: 42, percentage: 23, color: '#f59e0b' },
          { reason: 'Timeout', count: 34, percentage: 18, color: '#8b5cf6' },
          { reason: 'Authentication failure', count: 28, percentage: 15, color: '#0b5cff' },
          { reason: 'Other', count: 20, percentage: 11, color: '#64748b' },
        ],
        txnCount: 70, txnBaseAmount: 5000,
      },
      '90d': {
        revenueBase: 81000, revenueVariance: 14000, paymentBase: 310,
        successRate: '95.9%', successRateChange: '+2.6%',
        revenueChange: '+18.2%', failedPayments: 558, failedPaymentsChange: '-15.1%',
        revenueAtRisk: '₹2.16L', revenueAtRiskChange: '-4.2%',
        opportunityScore: 94, opportunityLabel: 'Very high growth potential',
        totalTransactions: 28260, avgTransactionValue: '₹2,568',
        totalRevenue: '₹72.6L', revenueValue: 7260000,
        paymentMethods: [
          { name: 'UPI', value: 47, color: '#0b5cff' },
          { name: 'Cards', value: 29, color: '#10b981' },
          { name: 'Net Banking', value: 15, color: '#f59e0b' },
          { name: 'Wallets', value: 9, color: '#8b5cf6' },
        ],
        failureReasons: [
          { reason: 'Insufficient funds', count: 186, percentage: 33, color: '#ef4444' },
          { reason: 'Bank decline', count: 126, percentage: 23, color: '#f59e0b' },
          { reason: 'Timeout', count: 102, percentage: 18, color: '#8b5cf6' },
          { reason: 'Authentication failure', count: 84, percentage: 15, color: '#0b5cff' },
          { reason: 'Other', count: 60, percentage: 11, color: '#64748b' },
        ],
        txnCount: 140, txnBaseAmount: 5000,
      },
    },
  },
};

const seedFor = (businessId: BusinessId, range: DateRange, salt: number) => {
  const bIdx = ['acme', 'nova', 'flowmart'].indexOf(businessId);
  const rIdx = ['today', '7d', '30d', '90d'].indexOf(range);
  return bIdx * 1000 + rIdx * 100 + salt;
};

const buildBusinessData = (businessId: BusinessId, range: DateRange): BusinessData => {
  const cfg = businessConfigs[businessId].ranges[range];
  const days = rangeDays[range];
  return {
    metrics: {
      totalRevenue: cfg.totalRevenue,
      revenueValue: cfg.revenueValue,
      revenueChange: cfg.revenueChange,
      successRate: cfg.successRate,
      successRateChange: cfg.successRateChange,
      failedPayments: cfg.failedPayments,
      failedPaymentsChange: cfg.failedPaymentsChange,
      revenueAtRisk: cfg.revenueAtRisk,
      revenueAtRiskChange: cfg.revenueAtRiskChange,
      opportunityScore: cfg.opportunityScore,
      opportunityLabel: cfg.opportunityLabel,
      totalTransactions: cfg.totalTransactions,
      avgTransactionValue: cfg.avgTransactionValue,
    },
    revenueSeries: generateRevenueSeries(cfg.revenueBase, cfg.revenueVariance, days, seedFor(businessId, range, 1)),
    paymentSeries: generatePaymentSeries(cfg.paymentBase, days, seedFor(businessId, range, 2)),
    successRateSeries: generateSuccessRateSeries(parseFloat(cfg.successRate), days, seedFor(businessId, range, 3)),
    paymentMethods: cfg.paymentMethods,
    failureReasons: cfg.failureReasons,
    transactions: generateTransactions(cfg.txnCount, cfg.txnBaseAmount, days, seedFor(businessId, range, 4)),
    customers: generateCustomers(days, seedFor(businessId, range, 5)),
  };
};

export const getBusinessData = (businessId: BusinessId, range: DateRange): BusinessData =>
  buildBusinessData(businessId, range);

export const businessDataMap: Record<BusinessId, BusinessData> = {
  acme: buildBusinessData('acme', '30d'),
  nova: buildBusinessData('nova', '30d'),
  flowmart: buildBusinessData('flowmart', '30d'),
};

export const businesses = [
  { id: 'acme' as const, name: 'Acme Store', industry: 'E-commerce' },
  { id: 'nova' as const, name: 'Nova Commerce', industry: 'D2C Retail' },
  { id: 'flowmart' as const, name: 'FlowMart', industry: 'Marketplace' },
];
