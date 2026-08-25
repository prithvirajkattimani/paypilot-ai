export const formatCurrency = (value: number): string => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${value.toLocaleString('en-IN')}`;
  return `₹${value}`;
};

export const formatCurrencyShort = (value: number): string => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

export const formatNumber = (value: number): string => value.toLocaleString('en-IN');

export const formatPercent = (value: number): string => `${value > 0 ? '+' : ''}${value}%`;
