import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className = '', hover = false, onClick }: CardProps) => (
  <div
    onClick={onClick}
    className={`rounded-xl border border-gray-200 bg-white shadow-card ${hover ? 'transition-all duration-200 hover:shadow-card-hover hover:border-gray-300 cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`flex items-center justify-between border-b border-gray-100 px-5 py-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <h3 className={`text-sm font-semibold text-navy-900 ${className}`}>{children}</h3>
);

export const CardBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
);
