import { useState, type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'right' | 'left';
}

export const Tooltip = ({ content, children, side = 'top' }: TooltipProps) => {
  const [show, setShow] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div className={`absolute z-50 whitespace-nowrap rounded-lg bg-navy-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-elevated animate-fade-in ${positions[side]}`}>
          {content}
        </div>
      )}
    </div>
  );
};
